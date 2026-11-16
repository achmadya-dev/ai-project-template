# Migration Structure and SQL Formatting Cleanup

## Goal

Reorganize `db/migrations/` so every supported database provider has a symmetrical dedicated subdirectory (`db/migrations/sqlite/`, `db/migrations/postgres/`, and `db/migrations/mysql/`), remove redundant `.gitkeep` files and loose root `.sql` files, and format all provider migration SQL files with clean, readable multi-line DDL.

## Scope

### Included

- Move PostgreSQL migration `db/migrations/001_auth.sql` into `db/migrations/postgres/001_auth.sql`.
- Remove redundant `db/migrations/sqlite/.gitkeep` and `db/migrations/mysql/.gitkeep` files.
- Reformat all SQL migration files (`db/migrations/sqlite/001_auth.sql`, `db/migrations/postgres/001_auth.sql`, and `db/migrations/mysql/001_auth_user.sql` through `009_auth_bootstrap_guard.sql`) from single-line minified DDL into readable multi-line SQL while preserving single-statement rules for MySQL.
- Update `scripts/migrate.mjs`, `tests/integration-postgres/database.test.ts`, `tests/unit/sqlite-defaults.test.ts`, `db/migrations/000_template.sql.example`, `db/migrations/README.md`, `README.md`, and `docs/ARCHITECTURE.md` to reference `db/migrations/postgres/`.

### Excluded

- Schema changes or functional modifications to migration logic.
- Unrelated application runtime logic.

## Risks

- High: Modifies `db/migrations/` and `scripts/migrate.mjs`. Existing disposable test databases that previously recorded checksums for single-line SQL files must be reset before running migrations against the newly formatted files.

## Verification Plan

- `bun run check`
- `bun run test:integration:postgres` (against disposable `app_test` PostgreSQL container)
- `bun run test:integration:mysql` (against disposable `app_test` MySQL container)
- `bun run verify`

## Verification Results

- `PATH="/tmp/opencode/node26-bin:$PATH" bun run check`: passed
- `TEST_DATABASE_URL="postgresql://app:test_only_password@127.0.0.1:32774/app_test" PATH="/tmp/opencode/node26-bin:$PATH" bun run test:integration:postgres`: 3 test files, 7 tests passed
- `TEST_MYSQL_URL="mysql://app:test_only_password@127.0.0.1:32775/app_test" PATH="/tmp/opencode/node26-bin:$PATH" bun run test:integration:mysql`: 3 test files, 5 tests passed
- `env -u TEST_DATABASE_URL -u TEST_MYSQL_URL -u DATABASE_URL PATH="/tmp/opencode/node26-bin:$PATH" PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH="$HOME/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell" bun run verify`: passed (check, unit tests, SQLite integration tests, production build, and Playwright E2E tests)
