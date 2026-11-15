# AI Project Template

A single-repository TanStack Start application for planning work, implementing it with your coding agent, and verifying changes through tests and pull requests. It does not depend on a particular agent or worker.

**Start with [START_HERE.md](START_HERE.md).** Reusable prompt examples are in [docs/PROMPTS.md](docs/PROMPTS.md).

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

The application requires the Bun version in `.bun-version`. SQLite runs locally without a separate database server. Node 24 is used by the current test tooling and policy-test runner; it is not the application runtime.

```sh
bun install --frozen-lockfile
if [ ! -e .env ]; then cp .env.example .env; fi
bun run dev
```

Open http://127.0.0.1:3000. The home page does not require a database. `DB_PROVIDER=sqlite` and `SQLITE_PATH=.data/app.sqlite` are the defaults; the file is created only when database access or migrations are requested. For PostgreSQL or MySQL, set `DB_PROVIDER=postgres` or `mysql` and set a matching `DATABASE_URL`. For compatibility an existing PostgreSQL `DATABASE_URL` without `DB_PROVIDER` selects PostgreSQL. Never combine `DB_PROVIDER=sqlite` with `DATABASE_URL`.

`bun run db:migrate` is explicit and targets the selected provider: numbered SQL files in `db/migrations/sqlite`, `db/migrations/mysql`, or the existing PostgreSQL `db/migrations` root. Confirm the target before running it. MySQL migration files must contain one statement each; its DDL cannot be rolled back reliably. An unfinished MySQL attempt stops subsequent migration runs for manual recovery. The development server binds to loopback.

SQLite needs a persistent local filesystem and is not automatically shared across application instances. For ephemeral or horizontally scaled hosting, select an appropriate production database. Changing `DB_PROVIDER` does not copy data; plan and verify export/import, compatibility, and backups separately.

The portable example uses Kysely; the existing `DatabaseClient`/`getDb()` and its migration history remain PostgreSQL-only for compatibility. Existing PostgreSQL-specific features must be ported and tested before switching provider. Production deployments must separately configure and verify TLS, credentials, backups, connection limits, and database roles. The tested MySQL baseline is 8.4; engine-specific behavior such as collations, timestamps, transactions and constraints may differ.

## Authentication setup

Authentication is optional until used. Configure a unique cryptographically random `AUTH_SECRET` of at least 32 characters and an `AUTH_BASE_URL` matching the browser origin. Production requires HTTPS; plain HTTP is permitted only for loopback development. Never commit the secret or send it to an agent. After confirming the selected database is the intended target, explicitly run `bun run db:migrate`, then `bun run auth:bootstrap` in a local interactive terminal. Enter the first administrator's name, required email, username, and password at the prompts; the password is not echoed. No default account is created.

Visit `/login` and sign in with username or email. An administrator can create ordinary accounts at `/account`; provide the initial password through a secure channel, and have the user change it. Public signup, OAuth, email verification and self-service password recovery are not enabled. Establish an identity-verification and credential-recovery process before production. The database-backed rate limiter defaults to a shared counter when no trusted proxy IP is configured; see `docs/SAFETY.md`. See `docs/runbooks/RECOVERY.md` if bootstrap is interrupted.

## Verify

```sh
bun run playwright install chromium
bun run verify
```

The default integration and example E2E tests use disposable SQLite databases and do not require Docker. To exercise PostgreSQL and MySQL, run `bun run test:integration:postgres` and `bun run test:integration:mysql` with `TEST_DATABASE_URL` and `TEST_MYSQL_URL` pointing to separately verified disposable databases ending in `_test`. The suffix alone does not prove isolation. CI runs all three provider suites.

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
- `db/migrations`: forward-only migrations; contains a non-executable example template, not an application schema.
- `tests`: unit, integration, and E2E tests.
- `docs`: product and domain context, procedures, decisions, task template, and recovery guidance.
- `scripts`: migration runner, task generator, PR metadata check, and smoke tests.
- `.github`: workflows, templates, and CODEOWNERS.

## Current limits

This template is **not a production-ready SaaS or payment system** and has no built-in business domain. Review authentication and design tenant isolation, business permissions, business audit, hosted backups, observability, and payment integrations for each project. Auth tables are created only by explicit migrations.

Repository rules and CI do not make agents infallible. Configure merge protection in GitHub; see [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md). Worker permissions belong to the tool you use. This repository does not include an MCP connection, token, global hook, or hidden deployment.

Dependencies are pinned in `bun.lock`. Nitro is currently a beta release; review dependency updates in pull requests and rerun the build and smoke checks. See [docs/VALIDATION.md](docs/VALIDATION.md) for baseline evidence and a reusable verification record.
