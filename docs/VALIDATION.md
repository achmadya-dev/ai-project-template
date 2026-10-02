# Bun migration validation

Task: [issue #8](https://github.com/achmadya-dev/ai-project-template/issues/8), branch `chore/bun-package-manager`.
Verified 2026-10-02 with Bun 1.4.2 and Node 24.19.0.

- `bun install --lockfile-only`: migrated the existing npm lockfile; direct dependency versions unchanged.
- Clean `bun install --frozen-lockfile`: passed, 254 platform-applicable packages installed.
- `bun run check`: passed lint, 8 policy tests, 11 unit tests, production build and typecheck.
- `bun run test:production`: passed HTTP 200 and production demo isolation without DB credentials.
- `bun run doctor`: detects Bun 1.4.2, Node 24, lockfile and Git; correctly reports absent local .env and optional GitHub CLI.
- `bun run playwright --version`: resolves the installed Playwright 1.58.2 CLI.
- PostgreSQL integration and browser verification: see PR checks for this branch. Not executed locally for this migration because disposable services from the bootstrap session are unavailable.

Runtime remains Node 24. Bun manages packages and launches scripts; Vitest remains the unit/integration runner. Use `bun run test`, not Bun's native `bun test`. Existing upstream bundler module-directive warnings remain; lint has zero warnings.

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

The Playwright browser CDN returned invalid archives in this environment. Browser checks were completed with a temporary Chromium 153 executable via `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. That optional override is supported by playwright.config.ts; the default setup still uses `npx playwright install chromium`. The alternate browser package is not a project dependency and is not included in the archive.

Nitro 3 is pinned to a beta release. The build emitted upstream bundler warnings about React module directives; build, browser scenario, and production smoke passed. Recheck on dependency upgrades. Runtime dependency audit does not cover all development dependencies or prove absence of application vulnerabilities.

GitHub repository and bootstrap issue were created after local validation. Hosted Actions execution is pending at upload time. CODEOWNERS now names the repository owner; rulesets enforcement and production deployment have not been configured. Review/setup instructions are in GITHUB_SETUP.md. The PR checker verifies metadata structure and risk hints; it does not validate business correctness, prove human approval, or confirm an issue exists.

## Reproduce
Follow README to prepare a disposable PostgreSQL database, install Chromium, then run `npm run verify`. Do not reuse production credentials. Exact dependencies are recorded in package-lock.json.
