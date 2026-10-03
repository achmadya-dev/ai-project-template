# ADR 0001: Typed backend core around TanStack Start and PostgreSQL

Status: accepted
Date: 2026-10-03
Task/issue: #21

## Context

The template originally let feature repositories receive `pg.Pool`, read `QueryResult.rows`, inspect PostgreSQL error codes/constraint names in repeated `try/catch` blocks, and validate the same input again after the transport boundary. Server functions also read `process.env` directly. That shape is small for one demo feature, but it spreads infrastructure details across every future vertical slice and makes request logging/error semantics inconsistent.

The replacement must keep SQL visible and parameterized, preserve TanStack Start's server-function/CSRF behavior, remain testable with real PostgreSQL, and avoid growing into an internal framework or speculative service hierarchy.

## Decision

Adopt a small backend core in `src/server/`:

- `env.server.ts` parses raw environment strings once into cached typed application config.
- `errors.ts` defines the client-safe application error contract: general kinds plus stable specific codes.
- `logger.server.ts` emits structured safe JSON logs.
- `request.ts` provides import-safe TanStack server-function middleware and shared result conversion for expected exposed failures. Its `.server()` callback dynamically loads `request.server.ts`, which owns request ID, timing, and error logging/normalization without pulling the server logger into the client graph. A callback to `.validator((input) => schema.parse(input))` preserves Zod errors for consistent normalization; direct Standard Schema validation is wrapped in a generic error by the pinned TanStack version.
- `database.server.ts` is the only application module that imports `pg`. It owns query-result plumbing, runtime row validation, generic PostgreSQL error normalization, and transaction lifecycle.
- `db.server.ts` lazily composes the runtime database from typed config.

Feature repositories keep domain-specific SQL explicit but depend only on `DatabaseClient`. They receive validated domain input, call `many`/`one`/`maybeOne`/`execute`, and configure known constraint-to-application-error mappings next to the query whose domain meaning is known.

Server functions remain thin TanStack boundaries: attach request middleware, validate with `.validator((input) => schema.parse(input))`, enforce policy/authorization, obtain the composed repository, and delegate. Existing automatic TanStack Start CSRF middleware remains in place by not introducing a custom `src/start.ts`.

ESLint enforces two important boundaries: feature/application modules cannot import `pg` outside the database adapter, and application code cannot access `process.env` outside `env.server.ts`.

## Alternatives

### Keep raw `pg` in every repository

Rejected because it repeats result extraction, constraint inspection, transaction/error plumbing, and driver types across feature code.

### Add Prisma, Drizzle, Kysely, or another ORM/query builder

Rejected for this template change because the concrete problem is infrastructure leakage rather than SQL authoring. The existing parameterized SQL is simple and explicit, and a new persistence dependency would add a larger runtime/tooling contract than needed.

### Add `BaseRepository`, generic CRUD services, managers, or processors

Rejected because the current domains do not share enough semantic CRUD behavior to justify inheritance or a generic service layer. Such abstractions would hide rather than clarify the domain-specific SQL and expected outcomes.

### Parse environment eagerly at module import

Rejected because optional development-only infrastructure such as `DATABASE_URL` should not make unrelated production builds fail. `getEnv()` caches parsing without opening connections or performing other hidden network work.

## Consequences

Feature code becomes shorter and no longer knows about `Pool`, `QueryResult`, `rows[0]`, raw PostgreSQL diagnostics, or `process.env`. Database rows gain runtime validation rather than relying only on TypeScript generics. Expected failures have consistent kinds/codes, and broad logging/error `try/catch` blocks are centralized.

The backend core is now a shared architectural dependency and must stay small. It is not an ORM or application framework. Changes to error serialization, database adapter semantics, environment parsing, or request middleware can affect many modules and therefore require normal high-risk review and cross-layer tests.

Because `*.functions.ts` participates in the client graph, middleware factories used at module scope must come from import-safe modules rather than `*.server.ts` files. Server-only work remains inside TanStack `.server()`/`.handler()` execution boundaries or dedicated server-only modules referenced only from those boundaries.

Structured console logging is only the baseline sink. A production observability vendor can replace `logger.server.ts` without changing feature repositories.

The change is source-compatible only after feature modules migrate to the new repository/request contracts, but it does not alter the PostgreSQL schema or persisted data. Recovery is a normal code revert.

## Verification

- `bun run check` must pass, including formatting, lint boundary rules, unit tests, build, and typecheck.
- PostgreSQL integration tests must prove normalized persistence, uniqueness under concurrency, constraint translation, parameterization, and migration behavior.
- Playwright must preserve the catalog create/reload/duplicate flow and responsive behavior.
- Production smoke must continue to boot safely when the development demo/database is disabled.
- Final PR diff must contain no temporary workflow/helper files and no migration/schema change.
