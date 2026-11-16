# Multi-database support

Status: in-progress
Risk: high
Issue: https://github.com/achmadya-dev/ai-project-template/issues/37
PR: not-created
Plan revision: 1
Authorization: user requested implementation; no production access or deployment authorized

## Goal

Use SQLite by default for local development and browser tests without a database server; allow a project to choose PostgreSQL or MySQL for production.

## Scope

Add an explicit provider selection and portable persistence seam, a runnable end-to-end example, versioned migration strategy, and database-specific contract tests. The initial implementation preserved PostgreSQL migration history. The follow-up in `docs/tasks/unify-provider-migrations.md` deliberately renames/splits auth migrations after confirmation that the project had not been run against a real database; existing databases with the previous migration history must not run the new migration set and need a separately reviewed recovery plan. The implementation branch is based on the unmerged template upgrade branch, so it depends on PR #36.

## Acceptance criteria

- [x] AC-1: Development and example E2E use an isolated local SQLite database by default without a database server.
- [x] AC-2: PostgreSQL and MySQL can be selected explicitly and execute the same example repository behavior; unsupported or conflicting configuration fails safely.
- [x] AC-3: Migration behavior is explicit, immutable, concurrency-safe per database, and preserves existing PostgreSQL migration history; no migration runs on application startup.
- [x] AC-4: Integration tests exercise success, validation, uniqueness, transactions, and important failure cases against all supported providers using disposable targets.
- [x] AC-5: Documentation covers setup, operational limitations, portable query constraints, backup, migration and the fact that switching provider does not move data.
- [x] AC-6: Run relevant checks and perform high-risk self-review; record limitations and do not claim unverified provider support.

## Domain invariants

No application schema is active by default. Do not trust client input or leak database errors. Do not access production or run migrations on an unknown target.

## Plan

1. Evaluate a typed query builder and its SQLite/Bun driver, preserving the existing PostgreSQL compatibility contract during the initial multi-provider implementation.
2. Add typed provider selection and a server-only portable database seam; exercise a real example with all providers.
3. Design migration safety separately for each engine, preserving existing migration checksums and acknowledging MySQL DDL semantics.
4. Make the example E2E use a disposable SQLite file by default; retain database-specific contract tests.
5. Update architecture, recovery, setup, and evidence; verify all supported configurations.

## Verification plan

Use temporary SQLite files and isolated disposable PostgreSQL/MySQL services. Run unit, provider contract, migration, E2E and production smoke tests. Run `bun run check`, and document anything that cannot be verified. Never reuse an unknown service.

## Compatibility and recovery

Provider configuration is an architecture change. Preserve existing PostgreSQL migration records and do not move data automatically. Keep migration runs explicit and review compatibility before any rollout. Restore from tested backups; reverting code does not undo schema changes.

## Decisions and questions

SQLite is the default for new local projects; using PostgreSQL or MySQL in production is an explicit configuration choice. Database types differ in transaction, locking and schema capabilities, so parity must be demonstrated rather than assumed.

## Evidence

Initial inspection: current driver, SQL parameter markers, sample repository, integration tests, and migration runner are PostgreSQL-specific. Existing PR #36 is unmerged and GitHub Actions is blocked by account billing. Dependencies under evaluation: Kysely, better-sqlite3 and mysql2; no implementation or migration has been completed.

Implementation in progress: added typed provider configuration, Kysely dialects, an SQLite default for the opt-in example and browser test, and separate provider migrations. A follow-up standardizes application persistence on Kysely and aligns provider migration names; see `docs/tasks/unify-provider-migrations.md` and ADR 0002. PostgreSQL migration history was not changed on any existing database; the new filenames are for databases that have not applied the old history. MySQL DDL is not transactional; a durable attempt marker blocks automatic retries after failure, requiring manual recovery. No production database or existing application data was accessed.

Local results:

- `bun run verify` with Bun 1.4.2 passed with no external database URLs: SQLite integration, home/browser tests, example browser test and production smoke. Browser execution used an existing Chromium revision 1255, not the Playwright-pinned revision 1208.
- PostgreSQL integration: 6 tests passed on a temporary isolated PostgreSQL container.
- MySQL integration: 4 tests passed on a temporary isolated MySQL 8.4 container, including migration locking, modified history, interrupted-migration refusal and multiple-statement rejection.
- SQLite integration: 3 tests passed, including migration rollback and history checks.
- `bun run test:database:bun`: SQLite, PostgreSQL and MySQL smoke checks passed under Bun 1.4.2.
- The example browser flow passed against PostgreSQL and MySQL in separately built production Bun applications and against SQLite in a production build. All server databases were disposable.
- `bun run db:migrate` against a newly created disposable SQLite path passed. No migration was run against an existing or production target.
- `bun audit --audit-level=high`: no high/critical advisories; three lower-severity advisories remain.

Limitations: CI and the pinned Playwright browser revision remain unverified because GitHub Actions is blocked by account billing. SQLite concurrent migration locking uses `BEGIN IMMEDIATE` and was exercised by concurrent calls, but a separate cross-process race test has not been run. Review native SQLite deployment, TLS configuration and MySQL migration recovery for each production environment. High-risk review is still required.

Follow-up verification after the migration-structure and persistence cleanup (2026-11-16):

- `bun run check`: passed, including build and typecheck.
- `bun run test:integration`: passed, 3 files/5 SQLite tests.
- PostgreSQL/MySQL suites were later rerun against isolated disposable `app_test` containers after the migration filenames changed; see `docs/tasks/unify-provider-migrations.md` for the current evidence and the host-port safety finding.
- `bun run test:e2e`: could not launch because the configured Playwright Chromium executable is not installed; no application assertions ran.
- Self-review completed. Existing databases with the previous migration history must not apply the renamed migrations without a separately reviewed recovery plan.
