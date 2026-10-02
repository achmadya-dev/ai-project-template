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
- `*.server.ts`: server-only infrastructure such as repositories. SQL and database-driver details stay here.
- `*.functions.ts`: transport boundary. Validate input, enforce authorization/policy, obtain server dependencies, and delegate to domain/repository code. Do not put SQL or substantial business logic here.
- `src/routes/`: presentation and user interaction. Routes may call server functions but must not access database/repository internals directly.
- `src/server/`: shared server infrastructure and cross-cutting server policy. It must not become a dumping ground for domain logic.

Dependencies should point inward: UI/transport -> domain/repository contracts; infrastructure may depend on domain types, but domain code must not depend on infrastructure.

## TypeScript

- Keep `strict`, `noUnusedLocals`, `noUnusedParameters`, and `noUncheckedIndexedAccess` enabled.
- Do not use `any` to bypass typing. Prefer `unknown` at untrusted boundaries and narrow/validate it.
- Do not use `as` assertions to silence a type mismatch unless the runtime invariant is proven next to the assertion and a safer model is impractical.
- Prefer discriminated unions for expected business outcomes instead of throwing for normal conditions such as duplicates or not-found results.
- Throw only for unexpected failures, violated programmer invariants, or failures that cannot be represented as an expected result.
- Keep public/domain types small and meaningful. Do not expose database-driver result types outside repository code.
- Prefer explicit names over comments that explain unclear names. Comments should explain non-obvious decisions or invariants, not restate code.

## Validation and trust boundaries

- Treat browser input, URL/search params, form data, request payloads, environment variables, database rows from untrusted/legacy sources, and external API responses as untrusted until validated or safely narrowed.
- Validate server-function input at the server boundary with the domain schema when possible.
- Client-side validation is user experience only; it never replaces server validation.
- Authorization/policy checks happen before protected side effects.
- Never trust tenant IDs, roles, ownership claims, prices, permission flags, or other security-sensitive values merely because the client sent them.

## Persistence

- Use parameterized SQL only. Never interpolate user-controlled values into SQL text.
- Keep SQL in server-only repository/infrastructure files.
- Make database constraints enforce invariants that must survive concurrency (for example uniqueness), then translate known constraint failures into explicit domain outcomes.
- Do not silently swallow database errors. Handle only errors that are intentionally translated; rethrow unexpected errors.
- Migrations are forward-only and immutable after application. Never edit an applied migration to make a test pass.
- Do not auto-run migrations against an unknown database target.

## Functions and side effects

- Prefer small functions with one reason to change. Extract code when doing so creates a meaningful domain/infrastructure concept, not merely to reduce line count.
- Keep side effects at boundaries. Domain functions should be deterministic whenever practical.
- Avoid hidden work during module import. Connecting to services, mutating data, starting workers, and other lifecycle actions must be explicit.
- Pass dependencies explicitly when it improves testability or prevents hidden global coupling.
- Do not add generic `utils`, `helpers`, `services`, or `common` modules when a domain-specific name is available.

## React and routes

- Keep route components focused on loading data, rendering state, and orchestrating user interaction.
- Do not put SQL, direct database access, secrets, or server-only infrastructure in route/client modules.
- Prefer server functions as the application boundary rather than ad-hoc client fetch calls for internal operations.
- Represent loading, disabled, error, empty, and success states intentionally when relevant.
- Preserve accessibility: semantic elements first, associated labels, keyboard behavior, useful status/error announcements, and no interaction that requires a pointer only.
- Do not duplicate domain validation rules in UI as the source of truth. UI constraints may mirror server rules for UX, but server/domain validation remains authoritative.

## Errors and observability

- Error messages exposed to users must be actionable without leaking secrets, SQL, stack traces, credentials, or internal topology.
- Preserve the original error/cause when adding context for logs or rethrowing where supported.
- Do not catch broad errors merely to return success, empty data, or a misleading fallback.
- Expected domain failures should have stable codes/types that UI can map to localized messages.

## Tests

Tests prove behavior, not implementation structure.

- Every meaningful behavior change needs a test at the cheapest layer that proves it.
- Domain rules: unit tests.
- Repository/SQL behavior, constraints, migrations, and concurrency: PostgreSQL integration tests.
- Critical user flows and browser behavior: Playwright E2E.
- Production runtime assumptions: production smoke tests.
- Include meaningful negative cases and boundary cases, not only the happy path.
- A regression fix should add a test that fails before the fix when practical.
- Do not mock the unit under test or reproduce the implementation algorithm inside the test.
- Never weaken, skip, delete, or broaden assertions merely to make CI green without documenting an intentional contract change.

## Security and sensitive changes

- Never commit secrets or real customer data. Use synthetic fixtures.
- Do not log credentials, tokens, full connection strings, or sensitive payloads.
- New auth, tenant isolation, permissions, payments, destructive operations, migrations, dependency changes, CI/governance changes, or public network exposure require explicit risk review.
- Default development servers to loopback unless the task explicitly requires network exposure and adds appropriate protection.

## Dependency and abstraction policy

Before adding a dependency, confirm that existing platform/framework capabilities are insufficient and record why the dependency is justified for non-trivial additions.

Before creating an abstraction, require at least one of these reasons:
- it represents a real domain concept;
- it isolates an infrastructure boundary;
- it removes verified duplication with the same semantics;
- it materially improves testability or safety.

Do not create speculative framework layers for hypothetical future requirements.

## Required self-review before declaring done

The implementing agent must review its own diff against this checklist before reporting completion:

- acceptance criteria are implemented without unrelated scope;
- architecture dependencies point in the allowed direction;
- untrusted input is validated and authorization precedes side effects;
- SQL is parameterized and invariants needed under concurrency exist in the database;
- expected business failures are modeled intentionally;
- no secret/server-only dependency leaks into client code;
- tests cover success, important failure cases, and the appropriate layer;
- no test, lint rule, type rule, or security control was weakened to obtain green checks;
- docs/ADR/runbook are updated when the contract or architecture changed;
- `bun run check` passes, plus integration/E2E/production checks when relevant.

If any item is intentionally not satisfied, the agent must state the exception and reason in the task/PR evidence instead of hiding it.
