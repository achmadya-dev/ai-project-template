# Unify provider migration structure

Status: in-review
Risk: high
Issue: https://github.com/achmadya-dev/ai-project-template/issues/55
PR: not-created
Plan revision: 2
Authorization: user approved migration renaming, structure cleanup, and audit; requested merge to main after resolving issues

## Goal

Make the full-stack template easier to understand and maintain by aligning provider migrations and removing unused persistence patterns.

## Scope

- Split the initial SQLite and PostgreSQL auth migration into files matching the existing MySQL migration sequence.
- Rename migrations with the `<number>_<action>_<object>.sql` pattern so each filename states what it creates.
- Update migration tests and guidance to enforce matching filenames.
- Preserve each provider's SQL dialect and schema behavior.
- Standardize application repositories on Kysely and remove the unused PostgreSQL-only adapter.
- Group provider migration runners under `scripts/migrations/`, separating shared history checks from provider-specific execution.
- Keep one migration CLI entry point and have tests import provider implementations directly; do not retain re-export-only runner wrappers.
- Centralize auth HTTP failure handling with safe structured logging.
- Separate the account page's account-creation and password-change forms; keep their state independent.

## Acceptance criteria

- [x] AC-1: All three provider directories contain the same migration filenames in the same order.
- [x] AC-2: Each migration file contains exactly one SQL statement.
- [x] AC-3: Filenames communicate the action and schema object.
- [x] AC-4: Kysely is the only application persistence interface; current features and migrations remain covered.
- [x] AC-5: Auth HTTP failures are logged once with safe fields and return generic responses.
- [x] AC-6: Account page delegates independent forms to auth UI modules with separate state.
- [x] AC-7: `bun run test:integration` and `bun run check` pass after all changes.
- [x] AC-8: Migration runner internals are organized by shared behavior and provider-specific execution without changing migration safety semantics.
- [x] AC-9: No re-export-only migration runner files remain; callers import provider implementations directly.

## Compatibility and recovery

High risk: this renames auth migrations and removes internal PostgreSQL adapter modules while changing auth error handling and architecture guidance. Renamed migrations change filenames and checksums; it is safe only before they have been applied. User confirmed the project has not been run against a real database. Existing databases with the old history must not run this migration set; they require a separate reviewed migration-history recovery plan. The removed adapter modules were not used by active application features.

## Evidence

- `bun run format`: passed.
- `bun run test:integration`: passed (3 files, 5 tests; SQLite integration).
- `bun run check`: passed after the final code changes (format, lint, policy tests, unit tests: 9 files/36 tests, production build, typecheck).
- `git diff --check`: passed; no active references remain to the removed adapter modules.
- `bun run test:e2e`: blocked because the configured Playwright Chromium executable is not installed; the tests did not reach application behavior.
- PostgreSQL/MySQL integration were not run for this revision because disposable test URLs were unavailable. Earlier provider-specific results in `docs/tasks/multi-database-support.md` predate these migration filename changes.
- Migration runner refactor: `scripts/migrations/shared.mjs` owns discovery/checksum/history validation; provider implementations live in `scripts/migrations/{sqlite,postgres,mysql}.mjs`; `scripts/migrate.mjs` is only the CLI.
- Removed the re-export-only `scripts/migrate-sqlite.mjs` and `scripts/migrate-mysql.mjs` entry files and redirected consumers to provider modules.
- `bun run check`: passed after runner refactor (15 policy tests, including shared migration and CLI config tests; 9 unit files/36 tests; build and typecheck).
- `bun run test:integration`: passed after runner refactor (3 files/5 SQLite tests).
- Audit: removed obsolete `DatabaseClient` API instructions from `docs/CODE_STANDARDS.md`; all HTTP auth responses now set `Cache-Control: no-store`, including 403/404/503, with unit coverage.
- `bun run check`: passed after audit (16 policy tests, 36 unit tests, build, typecheck).
- `bun run test:integration`: passed (3 files/5 SQLite tests); `bun run test:production`: passed on Bun 1.4.4.
- `bun run test:integration:mysql`: passed (3 files/5 tests) on an isolated Compose `app_test` service using tmpfs.
- The first PostgreSQL attempt failed against an unrelated service listening on port 5433 (`001_assistant_chat.sql` in its migration history). No reset or schema modification was made there. A newly created, isolated tmpfs PostgreSQL container on a verified random host port passed `bun run test:integration:postgres` (3 files/4 tests). The audit container was removed and the test Compose services were stopped.
- E2E still requires the pinned Playwright Chromium executable, which was unavailable in the earlier run. No claim of a passing browser test is made.
- Review and merge remain subject to the repository's high-risk review policy; passing local checks alone does not authorize self-approval.
- Full verification after the audit: `bun run verify` passed using an existing Chromium revision 1255 via `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` (check, SQLite integration 5/5, home E2E 4/4, example E2E 1/1, auth E2E 1/1, production smoke). The Playwright-pinned browser executable was not installed, so default browser provisioning remains a separate environment prerequisite.
- The account form extraction initially removed the pre-hydration disabled state. The auth E2E exposed a password-change failure; restoring the disabled state until hydration on both forms and sign-out resolved it. Assertions now target each form's own live status instead of assuming a single status on the page. The mechanical UI detector found no findings.
