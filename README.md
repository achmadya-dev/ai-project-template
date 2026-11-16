# AI Project Template

A single-repository TanStack Start application for planning work, implementing it with your coding agent, and verifying changes through tests and pull requests. It does not depend on a particular agent or worker.

**Start with [START_HERE.md](START_HERE.md)** for the documentation map. See [architecture](docs/ARCHITECTURE.md) for system boundaries, [workflow](docs/WORKFLOW.md) for the task lifecycle, and [reusable prompts](docs/PROMPTS.md) for agent requests.

## Included

- TanStack Start, React, TypeScript, Bun runtime through Nitro, and SQLite, PostgreSQL, and MySQL infrastructure.
- Tailwind CSS, ESLint, Prettier with Tailwind class sorting, and Husky/lint-staged for staged files.
- A starter home page with no built-in business feature.
- Versioned migrations with locking and checksums. SQLite and PostgreSQL run migrations transactionally; MySQL DDL requires manual recovery after interruption. Migrations never run automatically at application startup.
- Unit tests, SQLite integration tests, optional PostgreSQL/MySQL integration tests, Chromium E2E tests, and a production smoke test.
- `AGENTS.md` and adapters for Cursor, Claude, and Copilot, plus portable planning, implementation, and review procedures.
- Issue and pull request templates, a PR metadata check, CI, and GitHub ruleset setup guidance.
- Task and handoff templates for work that needs to persist beyond a chat session.
- [Optional capability guides](docs/capabilities/README.md) for SEO, AI, Markdown, CSP, health checks, and observability.
- [Supply-chain guidance](docs/SUPPLY_CHAIN.md) for dependency audits and secret-scanning decisions.
- Self-hosted Better Auth with username/email login, admin-only account creation, and explicit first-admin bootstrap.

## Run locally

Bun manages dependencies, runs development and build commands, and is the production application runtime. The Bun version is pinned in `.bun-version` and `packageManager`. Install Bun using the [official installation guide](https://bun.com/docs/installation). Nitro builds with the `bun` preset.

The application requires the Bun version in `.bun-version`. SQLite runs locally without a separate database server. Node 26 is used by the current test tooling and policy-test runner; it is not the application runtime.

Type checking uses TypeScript 7's native `tsc` and TypeScript 6's `tsc6`. The `typescript` dependency is the TypeScript 6 compatibility API required by `typescript-eslint`; the native compiler is installed separately as `@typescript/native`. Keep both checks enabled until the lint ecosystem supports the newer API. Node type definitions follow the Node 26 test-tool runtime specified in `.nvmrc`.

```sh
bun install --frozen-lockfile
if [ ! -e .env ]; then cp .env.example .env; fi
bun run dev
```

Open http://127.0.0.1:3000. The home page does not require a database. `DB_PROVIDER=sqlite` and `SQLITE_PATH=.data/app.sqlite` are the defaults; the file is created only when database access or migrations are requested. For PostgreSQL or MySQL, set `DB_PROVIDER=postgres` or `mysql` and set a matching `DATABASE_URL`. For compatibility, an existing PostgreSQL or MySQL `DATABASE_URL` without `DB_PROVIDER` selects the corresponding provider. Never combine `DB_PROVIDER=sqlite` with `DATABASE_URL`.

`bun run db:migrate` is explicit and targets the selected provider: numbered SQL files in `db/migrations/sqlite`, `db/migrations/mysql`, or the existing PostgreSQL `db/migrations` root. Confirm the target before running it. MySQL migration files must contain one statement each; its DDL cannot be rolled back reliably. An unfinished MySQL attempt stops subsequent migration runs for manual recovery. The development server binds to loopback.

SQLite needs a persistent local filesystem and is not automatically shared across application instances. For ephemeral or horizontally scaled hosting, select an appropriate production database. Changing `DB_PROVIDER` does not copy data; plan and verify export/import, compatibility, and backups separately.

The portable example uses Kysely; the existing `DatabaseClient`/`getDb()` and its migration history remain PostgreSQL-only for compatibility. Existing PostgreSQL-specific features must be ported and tested before switching provider. Production deployments must separately configure and verify TLS, credentials, backups, connection limits, and database roles. The tested MySQL baseline is 8.4; engine-specific behavior such as collations, timestamps, transactions and constraints may differ.

| Provider | Local setup | Migration directory | Test isolation |
| --- | --- | --- | --- |
| SQLite | Default; local file, no server | `db/migrations/sqlite/` | Temporary file by default |
| PostgreSQL | Explicit URL; optional Compose service | `db/migrations/` | Separately verified disposable `_test` database |
| MySQL | Explicit URL; opt-in Compose service | `db/migrations/mysql/` | Separately verified disposable `_test` database |

The directory identifies the selected provider's migration history; it does not transfer data between providers. See [migration guidance](db/migrations/README.md) before executing migrations.

### Optional server development databases

SQLite remains the default and does not require Compose. Both server databases are opt-in: run `docker compose --profile postgres up -d --wait db` for PostgreSQL or `docker compose --profile mysql up -d --wait mysql` for MySQL. Select a service or profile explicitly; a plain `docker compose up` has no default service. The PostgreSQL `db` service retains its `app-data` volume and loopback port 5432. MySQL uses a separate persistent `mysql-data` volume and loopback port 3307 by default.

After confirming the target, configure `DB_PROVIDER=postgres` and a matching PostgreSQL `DATABASE_URL`, or `DB_PROVIDER=mysql` and `DATABASE_URL=mysql://app:local_only_password@127.0.0.1:3307/app_dev`. These credentials are for local development only. Set `MYSQL_DEV_PORT` before starting Compose and update the URL if port 3307 is in use. Existing `.env` files are not modified, and migrations are never applied automatically.

## Authentication setup

Authentication is optional until used. Configure a unique cryptographically random `AUTH_SECRET` of at least 32 characters and an `AUTH_BASE_URL` matching the browser origin. Production requires HTTPS; plain HTTP is permitted only for loopback development. Never commit the secret or send it to an agent. After confirming the selected database is the intended target, explicitly run `bun run db:migrate`, then `bun run auth:bootstrap` in a local interactive terminal. Enter the first administrator's name, required email, username, and password at the prompts; the password is not echoed. No default account is created.

Visit `/login` and sign in with username or email. An administrator can create ordinary accounts at `/account`; provide the initial password through a secure channel, and have the user change it. Public signup, OAuth, email verification and self-service password recovery are not enabled. Establish an identity-verification and credential-recovery process before production. The database-backed rate limiter defaults to a shared counter when no trusted proxy IP is configured; see `docs/SAFETY.md`. See `docs/runbooks/RECOVERY.md` if bootstrap is interrupted.

## Verify

```sh
bun run playwright install chromium
bun run verify
```

The default integration and example E2E tests use disposable SQLite databases and do not require Docker. To exercise PostgreSQL and MySQL, run `bun run test:integration:postgres` and `bun run test:integration:mysql` with `TEST_DATABASE_URL` and `TEST_MYSQL_URL` pointing to separately verified disposable databases ending in `_test`. The suffix alone does not prove isolation. CI runs all three provider suites.

### PostgreSQL and MySQL integration and E2E

The following commands use the Compose test services only. Before starting, verify that the Compose project name and loopback ports are not already used by another project, and that the targets are disposable; do not reuse a development or production database. Both test services use ephemeral `tmpfs` storage: **all test database data is lost when the containers stop**. The tests create and remove tables or synthetic auth data; an interrupted run may leave test data behind.

```sh
docker compose -p template-e2e up -d --wait db-test mysql-test

TEST_DATABASE_URL=postgresql://app:local_only_password@127.0.0.1:5433/app_test bun run test:integration:postgres
TEST_MYSQL_URL=mysql://app:local_only_password@127.0.0.1:3308/app_test bun run test:integration:mysql

EXAMPLE_TEST_PROVIDER=postgres TEST_DATABASE_URL=postgresql://app:local_only_password@127.0.0.1:5433/app_test bun run test:example
EXAMPLE_TEST_PROVIDER=mysql TEST_MYSQL_URL=mysql://app:local_only_password@127.0.0.1:3308/app_test bun run test:example

AUTH_TEST_PROVIDER=postgres TEST_DATABASE_URL=postgresql://app:local_only_password@127.0.0.1:5433/app_test bun run test:auth
AUTH_TEST_PROVIDER=mysql TEST_MYSQL_URL=mysql://app:local_only_password@127.0.0.1:3308/app_test bun run test:auth
```

Run these commands sequentially; the E2E suites use fixed local application ports and modify their test databases. Auth tests apply explicit migrations to the selected test database. Use `POSTGRES_TEST_PORT` and `MYSQL_TEST_PORT` when starting Compose if ports 5433 or 3308 are occupied, and change the corresponding URLs above. For production-build E2E, set `EXAMPLE_PRODUCTION=1` for example tests; for auth tests, run `bun run build` first and set `AUTH_TEST_PRODUCTION=1`.

When finished, `docker compose -p template-e2e stop db-test mysql-test` stops only those test services and destroys their temporary data. Do not run `docker compose down -v`: it can delete persistent development volumes belonging to that Compose project. See `docs/runbooks/RECOVERY.md` before any cleanup.

Browser tests include automated accessibility and keyboard navigation checks for the starter home
page. Automated checks detect only some accessibility issues; manually test real workflows with a
keyboard and assistive technology.

| Command | Purpose |
| --- | --- |
| `bun run doctor` | Setup hints, pinned Bun version, and required tooling |
| `bun run format` | Format maintained source, tests, scripts, and config; sort Tailwind utilities |
| `bun run format:check` | Check formatting without modifying files |
| `bun run check` | Format check, lint, policy and unit tests, build, and typecheck; no database required |
| `bun run verify` | Run checks, SQLite integration, E2E, and Bun production smoke |
| `bun run test:integration:postgres` | Run PostgreSQL integration tests against a disposable target |
| `bun run test:integration:mysql` | Run MySQL integration tests against a disposable target |
| `bun run task:new <slug>` | Create a task document from the task template without overwriting existing files |
| `bun run db:migrate` | Apply migrations to the selected provider; confirm the target first |
| `bun run build && bun run start` | Build and run the production application with Bun and Nitro's Bun preset |

## Workflow

1. Open the repository in your coding tool and ask the agent to read `AGENTS.md`.
2. Describe the product or feature. The agent should draft an issue or local task with acceptance criteria.
3. Approve the plan, or explicitly authorize direct implementation when the scope is clear.
4. The agent creates a branch, implements the change, verifies it, updates documentation, and prepares a pull request with evidence.
5. Review behavior and CI before merging. The template does not enable auto-merge or auto-deployment.

If GitHub is unavailable, create a local task from `docs/tasks/TEMPLATE.md`. Do not claim an issue or pull request exists until it has actually been created.

## Structure

- `src/routes`: pages and TanStack transport.
- `src/modules/<domain>`: location for approved domain slices.
- `src/server`: shared server infrastructure.
- `db/migrations`: forward-only provider-specific auth migrations and a non-executable example template; migrations run only when explicitly requested.
- `tests`: unit, integration, and E2E tests.
- `docs`: product and domain context, procedures, decisions, task template, and recovery guidance.
- `scripts`: migration runner, task generator, PR metadata check, and smoke tests.
- `.github`: workflows, templates, and CODEOWNERS.

## Current limits

This template is **not a production-ready SaaS or payment system** and has no built-in business domain. Review authentication and design tenant isolation, business permissions, business audit, hosted backups, observability, and payment integrations for each project. Auth tables are created only by explicit migrations.

Repository rules and CI do not make agents infallible. Configure merge protection in GitHub; see [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md). Worker permissions belong to the tool you use. This repository does not include an MCP connection, token, global hook, or hidden deployment.

Dependencies are pinned in `bun.lock`. Nitro is currently a beta release; review dependency updates in pull requests and rerun the build and smoke checks. See [docs/VALIDATION.md](docs/VALIDATION.md) for baseline evidence and a reusable verification record.
