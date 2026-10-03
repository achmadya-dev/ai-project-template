# Bun migration validation

> Historical validation record: the revision tested below still contained the catalog demo. That feature and its `DEMO_ENABLED` switch were later removed; these results describe the historical revision, not verification of the current tree. The immutable initial catalog migration remains in the migration history.

Task: [issue #8](https://github.com/achmadya-dev/ai-project-template/issues/8), branch `chore/bun-package-manager`.
Target: Bun 1.4.2 for dependency management and the application runtime. Node 24 is retained only for current Vitest/Playwright tooling compatibility.

## Current Bun migration evidence
The package-manager-only revision was verified 2026-10-02 with Bun 1.4.2 and Node 24.19.0 tooling. Hosted GitHub Actions run `37075210368` passed quality, PostgreSQL integration, browser E2E, build and production smoke.

The final revision additionally changes the application runtime to Bun:
- Nitro uses preset `bun`.
- Development and production build invoke Vite with Bun (`bunx --bun vite`).
- Production starts with `bun .output/server/index.mjs`.
- `bun run test:production` executes the smoke harness on Bun, asserts that Bun is the harness runtime, and launches the built server with that same Bun executable.
- Migration/task/doctor utility scripts run with Bun.
- `.bun-version` and `packageManager` pin Bun 1.4.2; `bun.lock` remains the dependency source of truth.

The current PR checks are the authoritative final verification for this full-runtime revision. Do not treat the earlier Node-runtime smoke as evidence for the final runtime target.

Vitest remains the unit/integration runner and Playwright remains the browser runner. Their current upstream documentation still lists Node prerequisites, so CI keeps Node 24 for test tooling only. Use `bun run test`, not Bun's native `bun test`, when invoking the Vitest suite. Existing upstream bundler module-directive warnings remain; lint requires zero warnings.

## Historical bootstrap evidence (before Bun migration)
The following records the original npm-based checks; these commands are historical, not current setup instructions. Current commands are in README.

# Original validation record

Date: 2026-10-02 UTC. Verification concerns this delivered template, not a production deployment.

## Executed

| Check | Result |
| --- | --- |
| Clean `npm ci` | Passed; lockfile reproducible in this environment |
| `npm run lint` | Passed with zero lint warnings |
| `npm run test:policy` | 5 tests passed |
| `npm test` | 11 unit tests passed |
| `npm run build` | Passed; Node/Nitro production artifact emitted |
| `npm run typecheck` | Passed |
| `npm run test:integration` | 6 tests passed against actual PostgreSQL 17.9 |
| `npm run test:e2e` | 1 browser scenario passed: create, reload, duplicate, no page errors, mobile overflow check |
| `npm run test:production` | Passed: production artifact returns 200 with demo disabled even with NODE_ENV=development and DEMO_ENABLED=true, without database credentials |
| `npm audit --omit=dev --audit-level=high` | Reported zero known vulnerabilities at execution time; not a security guarantee |
| YAML parsing | Compose and GitHub YAML files parsed successfully |
| Visual inspection | Desktop and mobile screenshots inspected |

`npm run verify` runs the code checks, integration, browser scenario, and production smoke sequentially. PostgreSQL tests exercise concurrent uniqueness, DB constraints, SQL parameterization, repeat migration execution, and rejection of an edited applied migration.

## Environment and limitations
Node 24.19.0. A temporary PostgreSQL 17.9 process was used because Docker was not available here. Docker Compose service startup was not exercised; its YAML was parsed. Tests used synthetic data and a separate `_test` database.

The Playwright browser CDN returned invalid archives in this environment. Browser checks were completed with a temporary Chromium 153 executable via `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. That optional override is supported by playwright.config.ts; the default setup still used `npx playwright install chromium`. The alternate browser package is not a project dependency and is not included in the archive.

Nitro 3 is pinned to a beta release. The build emitted upstream bundler warnings about React module directives; build, browser scenario, and production smoke passed. Recheck on dependency upgrades. Runtime dependency audit does not cover all development dependencies or prove absence of application vulnerabilities.

GitHub repository and bootstrap issue were created after local validation. CODEOWNERS now names the repository owner; rulesets enforcement and production deployment have not been configured. Review/setup instructions are in GITHUB_SETUP.md. The PR checker verifies metadata structure and risk hints; it does not validate business correctness, prove human approval, or confirm an issue exists.

## Historical reproduction
The original bootstrap can be reproduced from the pre-migration revision with npm and `package-lock.json`. For the current repository, follow README and use Bun commands plus the current PR checks. Never reuse production credentials.
