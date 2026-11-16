# SQLite default consistency

Status: done
Risk: high
Issue: #51
PR: #52
Plan revision: 1
Authorization: user requested checking repository notes and files and ensuring SQLite is the default. No existing database migration, data transfer, production access, or deployment authorized.

## Goal

Ensure new-project metadata, example configuration, local services, tests, and current guidance consistently identify SQLite as the default while preserving explicit PostgreSQL and MySQL support.

## Scope

Review tracked documentation and configuration, correct misleading current guidance, make server-database examples opt-in, and add focused verification. Preserve historical task evidence, existing environment files, database contents, applied migrations, and the established `DATABASE_URL` compatibility behavior.

## Acceptance criteria

- [x] AC-1: Agent metadata and example environment identify SQLite as the default and do not silently opt into server-backed smoke tests.
- [x] AC-2: PostgreSQL and MySQL Compose development services are opt-in; existing named services, ports, volumes, and explicit selection remain available.
- [x] AC-3: Current documentation distinguishes SQLite defaults from PostgreSQL compatibility examples and provider-specific disposable tests.
- [x] AC-4: Tests and configuration checks verify default SQLite, explicit provider compatibility, and server-service opt-in without touching existing databases.
- [x] AC-5: Run relevant checks, document actual results, compatibility impacts, limitations, and high-risk review.

## Domain invariants

Do not migrate, delete, reset, or connect to unknown databases. Existing PostgreSQL/MySQL configurations and migration history remain supported. A test database suffix alone does not prove isolation.

## Plan

1. Audit current configuration, agent metadata, and documentation for misleading defaults.
2. Correct defaults and current guidance while retaining historical evidence and explicit provider support.
3. Validate positive and negative configuration paths, Compose profiles, and default checks.

## Verification plan

Run unit and relevant SQLite verification, `docker compose config` for default and explicit profiles, `bun run check` and `bun run verify` with a known temporary browser configuration. Do not start existing database services or read existing secrets.

## Compatibility and recovery

The PostgreSQL Compose service retains its name, port, and persistent volume but requires explicit selection or the `postgres` profile. Existing `.env` files are not modified. Reverting metadata and Compose configuration does not revert external database effects.

## Decisions and questions

Retain the established inference that a configured PostgreSQL or MySQL `DATABASE_URL` selects that provider when `DB_PROVIDER` is unset. SQLite is the default when neither is selected; changing this inference could redirect existing projects to a different database.

## Evidence

- Initial audit found `.ai/project.json` still advertised PostgreSQL, `.env.example` enabled a PostgreSQL test URL, and the PostgreSQL Compose development service had no opt-in profile.
- Added `tests/unit/sqlite-defaults.test.ts` (4 tests) verifying default SQLite selection, `.env.example` and `.ai/project.json` defaults, explicit PostgreSQL/MySQL provider selection and conflict rejection, and `compose.yaml` opt-in profiles (`postgres`, `mysql`, `test`).
- `docker compose --env-file /dev/null config --services` returned no default services; `--profile postgres` returned `db`; `--profile mysql --profile test` returned `db-test`, `mysql`, and `mysql-test`.
- With Bun 1.4.2 and Node 26.13.0, `bun run check`, `bun run test:database:bun` (with `TEST_DATABASE_URL`, `TEST_MYSQL_URL`, and `DATABASE_URL` unset), and `bun run verify` all passed (31 unit tests, 5 SQLite integration tests, 4 home E2E tests, 1 example E2E test, 1 auth E2E test, and Bun production smoke). Browser tests used local Chromium headless shell revision 1255 rather than Playwright's pinned revision 1243.
- Self-review: high-risk paths (`.ai/project.json` and `docs/PATTERNS.md`) were modified to keep agent metadata and architecture examples consistent with the SQLite-first contract. No database migrations were executed against persistent targets, no secrets or existing `.env` files were modified, and explicit PostgreSQL/MySQL compatibility was preserved. Hosted GitHub Actions CI remains blocked by account billing.

