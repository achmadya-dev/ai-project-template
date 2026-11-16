# Verification evidence

## Choose checks for the change

The commands below describe the current verification entry points; the historical baseline that follows is not a claim about the current revision. Record actual commands and results in the task or PR.

| Change or question | Starting check | Important limitation |
| --- | --- | --- |
| Formatting, lint, unit tests, build, and typecheck | `bun run check` | Does not exercise browser flows or external database providers |
| Default local end-to-end verification | `bun run verify` | Uses SQLite for default integration and browser tests; requires Playwright Chromium |
| PostgreSQL or MySQL persistence | `bun run test:integration:postgres` or `bun run test:integration:mysql` | Requires a separately verified disposable `_test` database |
| Provider-specific example or auth browser flow | `bun run test:example` or `bun run test:auth` with provider and test URL | Select the provider explicitly; the test can mutate the test database |
| Production Bun runtime | `bun run test:production` after a build | A smoke check is not proof of production readiness |

See the [README](../README.md#postgresql-and-mysql-integration-and-e2e) for provider-specific commands and isolation requirements.

## Template cleanup baseline

Base commit: `096e3f2`. Checks below ran against the working tree on branch `docs/english-template-cleanup`.
Issue: [#28](https://github.com/achmadya-dev/ai-project-template/issues/28). Pull request: [#29](https://github.com/achmadya-dev/ai-project-template/pull/29) (draft).

### Acceptance criteria

- Repository-maintained documentation and templates use English; this language rule is recorded in `AGENTS.md`.
- All visible application copy and the document language declaration use English.
- The starter contains only ADR/task templates and a non-executable migration example. No application migration was run.
- Local setup preserves an existing `.env`; the generic error page no longer directs users to a database that the home page does not need.

### Results

| Check | Result |
| --- | --- |
| `bun run format` | Passed |
| `bun run check` | Passed: format check, lint, policy tests (2/2), unit tests (12/12), Bun build, and typecheck |
| `node --test scripts/new-task.test.mjs` | Passed (1/1) |
| `bun run task:new verification-smoke` | Passed; generated file was inspected and removed |
| `bun run doctor` | Bun 1.4.2 matches the pin; `.env` is absent; GitHub CLI is unauthenticated |
| Language and stale-reference scan | Passed: no prior Indonesian UI copy or references to the removed ADR/task/migration records remain |
| `git diff --check` | Passed |
| E2E and production smoke | Blocked: the sandbox denied the loopback server bind with `EPERM` |
| PostgreSQL integration | Not run: Docker socket access was denied and port 5433 had no response |

The production build emitted upstream Nitro/Rolldown module-directive warnings. Build and typecheck still passed. The E2E and production smoke checks could not start their loopback servers. No database service was started, no migration command was run, and no database was changed.

## Reusable verification record

For future project changes, copy and complete this section with actual evidence. Do not claim a command passed unless it was run.

### Revision and environment

- Commit or branch:
- Date:
- Bun version:
- Node version, if used:
- Database/browser environment, if relevant:

### Results

| Acceptance criterion or behavior | Command or observation | Actual result | Limitation or evidence link |
| --- | --- | --- | --- |
| [AC-1] | [command / manual observation] | [passed / failed / blocked] | [notes / link] |

### Relevant checks

- `bun run format:check`:
- `bun run lint`:
- `bun run test:policy`:
- `bun run test`:
- `bun run build`:
- `bun run typecheck`:
- Integration, E2E, and production checks when relevant:

Default integration tests use disposable SQLite files. PostgreSQL and MySQL tests require a separately verified disposable database and the corresponding `TEST_DATABASE_URL` or `TEST_MYSQL_URL` ending in `_test`. A database name suffix alone does not prove the target is disposable. Do not run migrations against an unknown target.

### Limitations and follow-up

- Unrun checks and the reason:
- External CI, issue, or pull request evidence still needed:
- Follow-up work:
