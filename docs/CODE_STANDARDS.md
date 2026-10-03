# Code standards

This document is the normative coding contract for this repository. `AGENTS.md` defines how work is performed; this file defines what acceptable implementation looks like. When examples, existing code, or tool suggestions conflict with this document, follow this document unless the task explicitly changes the architecture and records that decision.

## Priority

1. Product/domain invariants and accepted task criteria.
2. Security and data integrity.
3. The architecture boundaries below.
4. Correctness and testability.
5. Simplicity and readability.
6. Performance only when a measured or clearly bounded need exists.

Do not introduce abstractions, dependencies, caches, queues, service layers, repositories, hooks, or utilities merely because they might be useful later.

## Architecture boundaries

Use a vertical slice under `src/modules/<domain>/`.

- `domain/`: pure business rules, schemas, domain types, and deterministic transformations. No React, TanStack, database, process/environment, filesystem, network, or other infrastructure dependencies.
- `*.server.ts`: server-only domain infrastructure such as repositories. SQL stays here, but raw driver plumbing belongs to the shared database adapter.
- `*.functions.ts`: transport boundary. Attach request/validation middleware, enforce authorization/policy, obtain composed dependencies, and delegate to domain/repository code. Do not put SQL or substantial business logic here.
- `src/routes/`: presentation and user interaction. Routes may call server functions but must not access database/repository internals directly.
- `src/server/`: small shared server infrastructure and cross-cutting policy: typed environment, application errors, logging/request middleware, database adapter, and runtime composition. It must not become a dumping ground for domain logic.

Dependencies should point inward: UI/transport -> domain/repository contracts; infrastructure may depend on domain schemas/types for validation, but domain code must not depend on infrastructure.

## TypeScript

- Keep `strict`, `noUnusedLocals`, `noUnusedParameters`, and `noUncheckedIndexedAccess` enabled.
- Do not use `any` to bypass typing. Prefer `unknown` at untrusted boundaries and narrow/validate it.
- Do not use `as` assertions to silence a type mismatch unless the runtime invariant is proven next to the assertion and a safer model is impractical.
- Expected failures must have stable machine-readable codes. Use discriminated result unions at API/UI boundaries when the caller should branch without exceptions. Shared infrastructure may use `AppError` internally and convert exposed expected failures to a result at the request boundary.
- Throw only for unexpected failures, violated programmer invariants, policy rejection, or failures intentionally handled by the shared request boundary.
- Keep public/domain types small and meaningful. Do not expose database-driver result types outside `src/server/database.server.ts`.
- Prefer explicit names over comments that explain unclear names. Comments should explain non-obvious decisions or invariants, not restate code.

## Validation and trust boundaries

- Treat browser input, URL/search params, form data, request payloads, environment variables, database rows from untrusted/legacy sources, and external API responses as untrusted until validated or safely narrowed.
- Validate server-function input at the server boundary with the domain schema. Prefer the shared validation middleware so invalid input has consistent error semantics.
- Validate database rows at runtime before returning them from the database/repository boundary; a TypeScript generic on `pg.query<T>()` is not runtime validation.
- Client-side validation is user experience only; it never replaces server validation.
- Authorization/policy checks happen before protected side effects.
- Never trust tenant IDs, roles, ownership claims, prices, permission flags, or other security-sensitive values merely because the client sent them.

## Environment and configuration

- Application server code reads typed configuration through `getEnv()` from `src/server/env.server.ts`; do not scatter `process.env.*` reads through repositories or server functions.
- Parse raw environment strings once into intentional types. Do not treat arbitrary truthy strings as booleans.
- Optional infrastructure config may remain optional until the feature that needs it is invoked. For example, a production build with the development demo disabled must not fail merely because `DATABASE_URL` is intentionally absent.
- Test harnesses, build/tooling config, scripts, and process launchers may read or set environment variables directly because they are outside the application runtime boundary.
- Never expose server config through `VITE_*` unless the value is intentionally public.

## Persistence

- Use parameterized SQL only. Never interpolate user-controlled values into SQL text.
- Keep domain-specific SQL in server-only repository files.
- Feature repositories depend on `DatabaseClient`, not `pg.Pool`, `PoolClient`, `QueryResult`, or raw PostgreSQL error objects.
- `src/server/database.server.ts` owns `pg` query/result plumbing, row parsing, transaction lifecycle, and generic PostgreSQL error normalization.
- Make database constraints enforce invariants that must survive concurrency (for example uniqueness), then map known constraint names next to the domain query that understands their meaning.
- Do not add repository-level `try/catch` merely to inspect PostgreSQL code/constraint fields; use the adapter mapping. Catch locally only when that scope can recover or translate a meaning that cannot be expressed by the adapter configuration.
- Do not silently swallow database errors. Unknown failures must propagate to the request boundary and become non-exposed internal errors.
- Use `one` when exactly one row is an invariant, `maybeOne` when zero is expected, `many` for collections, and `execute` for row-count-only operations. Do not manually read `result.rows[0]` in feature code.
- Migrations are forward-only and immutable after application. Never edit an applied migration to make a test pass.
- Do not auto-run migrations against an unknown database target.

## Request handling, errors, and observability

- Use the shared application error taxonomy for cross-cutting semantics: `invalid_argument`, `not_found`, `conflict`, `unauthorized`, `forbidden`, `rate_limited`, and `internal`.
- Pair the generic kind with a stable specific code such as `DUPLICATE_SKU` when a caller or UI needs domain-specific behavior.
- Use the shared TanStack server-function request middleware for request ID, duration, structured logging, and centralized normalization of thrown failures.
- Expected exposed `AppError`s may be converted with the shared request-result helper when the UI should branch on them without exception handling.
- Do not duplicate broad `try/catch` logging blocks in every server function or repository.
- Error messages exposed to users must be actionable without leaking secrets, SQL, stack traces, credentials, internal topology, or raw database details.
- Preserve the original error/cause internally when adding context, but logs should record stable safe fields rather than request bodies, connection strings, tokens, or database error details that may contain user data.
- Structured JSON console logging is the template baseline. A production sink/vendor can replace the logger at the shared boundary without changing feature code.

## Functions and side effects

- Prefer small functions with one reason to change. Extract code when doing so creates a meaningful domain/infrastructure concept, not merely to reduce line count.
- Keep side effects at boundaries. Domain functions should be deterministic whenever practical.
- Avoid hidden network work during module import. Creating a lazy configuration/repository holder is acceptable; connecting to services, mutating data, starting workers, and other lifecycle actions must happen on demand or explicitly.
- Pass dependencies explicitly at composition boundaries when it improves testability or prevents hidden global coupling. Do not pass `pg.Pool` through every repository function call.
- Do not add generic `utils`, `helpers`, `services`, or `common` modules when a precise domain/infrastructure name is available.

## React and routes

- Keep route components focused on loading data, rendering state, and orchestrating user interaction.
- Do not put SQL, direct database access, secrets, or server-only infrastructure in route/client modules.
- Prefer server functions as the application boundary rather than ad-hoc client fetch calls for internal operations.
- Represent loading, disabled, error, empty, and success states intentionally when relevant.
- Map stable request error codes/kinds to user-facing copy at the UI boundary; do not expose raw PostgreSQL/framework errors.
- Preserve accessibility: semantic elements first, associated labels, keyboard behavior, useful status/error announcements, and no interaction that requires a pointer only.
- Do not duplicate domain validation rules in UI as the source of truth. UI constraints may mirror server rules for UX, but server/domain validation remains authoritative.

## Tests

Tests prove behavior, not implementation structure.

- Every meaningful behavior change needs a test at the cheapest layer that proves it.
- Domain rules and typed environment/error normalization: unit tests.
- Repository/database adapter SQL behavior, constraints, row validation, migrations, and concurrency: PostgreSQL integration tests.
- Critical user flows and browser behavior: Playwright E2E.
- Production runtime assumptions: production smoke tests.
- Include meaningful negative cases and boundary cases, not only the happy path.
- A regression fix should add a test that fails before the fix when practical.
- Do not mock the unit under test or reproduce the implementation algorithm inside the test.
- Never weaken, skip, delete, or broaden assertions merely to make CI green without documenting an intentional contract change.

## Security and sensitive changes

- Never commit secrets or real customer data. Use synthetic fixtures.
- Do not log credentials, tokens, full connection strings, sensitive payloads, or raw database diagnostic details that may contain values.
- New auth, tenant isolation, permissions, payments, destructive operations, migrations, dependency changes, CI/governance changes, or public network exposure require explicit risk review.
- Default development servers to loopback unless the task explicitly requires network exposure and adds appropriate protection.
- Keep TanStack Start CSRF protection enabled for server functions. If a future change defines a custom `src/start.ts`, explicitly preserve the framework CSRF middleware as documented by the pinned framework version.

## Dependency and abstraction policy

Before adding a dependency, confirm that existing platform/framework capabilities are insufficient and record why the dependency is justified for non-trivial additions.

Before creating an abstraction, require at least one of these reasons:
- it represents a real domain concept;
- it isolates an infrastructure boundary;
- it removes verified duplication with the same semantics;
- it materially improves testability or safety.

The typed env boundary, database adapter, application error model, request middleware, and logger are justified cross-cutting infrastructure boundaries. Do not grow them into an internal ORM or application framework.

Do not create speculative framework layers for hypothetical future requirements.

## Required self-review before declaring done

The implementing agent must review its own diff against this checklist before reporting completion:

- acceptance criteria are implemented without unrelated scope;
- architecture dependencies point in the allowed direction;
- untrusted input, environment, and database rows are validated at their boundaries;
- authorization precedes protected side effects;
- SQL is parameterized and invariants needed under concurrency exist in the database;
- feature repositories do not leak `pg` types/result/error handling;
- expected failures use stable kinds/codes and unexpected failures do not leak details;
- no secret/server-only dependency leaks into client code;
- tests cover success, important failure cases, and the appropriate layer;
- no test, lint rule, type rule, or security control was weakened to obtain green checks;
- docs/ADR/runbook are updated when the contract or architecture changed;
- `bun run check` passes, plus integration/E2E/production checks when relevant.

If any item is intentionally not satisfied, the agent must state the exception and reason in the task/PR evidence instead of hiding it.
