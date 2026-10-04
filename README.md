# AI Project Template

A single-repository TanStack Start application for planning work, implementing it with your coding agent, and verifying changes through tests and pull requests. It does not depend on a particular agent or worker.

**Start with [START_HERE.md](START_HERE.md).** Reusable prompt examples are in [docs/PROMPTS.md](docs/PROMPTS.md).

## Included

- TanStack Start, React, TypeScript, Bun runtime through Nitro, and PostgreSQL infrastructure.
- Tailwind CSS, ESLint, Prettier with Tailwind class sorting, and Husky/lint-staged for staged files.
- A starter home page with no built-in business feature.
- A versioned, transactional migration runner with locking and checksums. Migrations never run automatically at application startup.
- Unit tests, PostgreSQL integration tests for the adapter and migration runner, a Chromium home-page E2E test, and a production smoke test.
- `AGENTS.md` and adapters for Cursor, Claude, and Copilot, plus portable planning, implementation, and review procedures.
- Issue and pull request templates, a PR metadata check, CI, and GitHub ruleset setup guidance.
- Task and handoff templates for work that needs to persist beyond a chat session.

## Run locally

Bun manages dependencies, runs development and build commands, and is the production application runtime. The Bun version is pinned in `.bun-version` and `packageManager`. Install Bun using the [official installation guide](https://bun.com/docs/installation). Nitro builds with the `bun` preset.

The application requires the Bun version in `.bun-version`. Docker Compose or PostgreSQL is needed only for integration tests. Node 24 is used by the current test tooling and policy-test runner; it is not the application runtime.

```sh
bun install --frozen-lockfile
if [ ! -e .env ]; then cp .env.example .env; fi
bun run dev
```

Open http://127.0.0.1:3000. The home page does not require a database. Configure `DATABASE_URL` only when a new feature needs database access. `bun run db:migrate` applies numbered `.sql` files in `db/migrations`; the `.sql.example` template there is not executed. The development server binds to loopback. Do not expose it to a network without authentication.

## Verify

```sh
docker compose --profile test up -d --wait db-test
bun run playwright install chromium
bun run verify
```

`TEST_DATABASE_URL` in `.env.example` targets a separate test database on port 5433. Integration tests require a disposable database whose name ends in `_test`. The name alone does not prove isolation; use only disposable test credentials. The E2E home-page test does not require a database.

| Command | Purpose |
| --- | --- |
| `bun run doctor` | Setup hints, pinned Bun version, and required tooling |
| `bun run format` | Format maintained source, tests, scripts, and config; sort Tailwind utilities |
| `bun run format:check` | Check formatting without modifying files |
| `bun run check` | Format check, lint, policy and unit tests, build, and typecheck; no database required |
| `bun run verify` | Run checks, PostgreSQL integration, E2E, and Bun production smoke |
| `bun run task:new <slug>` | Create a task document from the task template without overwriting existing files |
| `bun run db:migrate` | Apply migrations to `DATABASE_URL`; confirm the target first |
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

This template is **not a production-ready SaaS or payment system** and has no built-in business domain. Authentication, tenant isolation, roles and permissions, business audit, hosted backups, observability, and payment integrations must be designed for each project. The database has no application schema until a project adds an approved migration.

Repository rules and CI do not make agents infallible. Configure merge protection in GitHub; see [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md). Worker permissions belong to the tool you use. This repository does not include an MCP connection, token, global hook, or hidden deployment.

Dependencies are pinned in `bun.lock`. Nitro is currently a beta release; review dependency updates in pull requests and rerun the build and smoke checks. See [docs/VALIDATION.md](docs/VALIDATION.md) for baseline evidence and a reusable verification record.
