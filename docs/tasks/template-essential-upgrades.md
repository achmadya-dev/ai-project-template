# Essential template upgrades

Status: in-progress
Risk: high for dependency or CI changes; otherwise medium
Issue: https://github.com/achmadya-dev/ai-project-template/issues/35
PR: not-created
Plan revision: 2
Authorization: user requested implementation and merge, subject to verification and required review

## Goal

Improve the reusable starter's accessibility, implementation guidance, and supply-chain safety without turning it into a product or requiring infrastructure for the default home page.

## Scope

Implement accessibility verification, an executable opt-in vertical-slice example, supply-chain security evaluation, and an optional capability catalog for SEO, AI, Markdown, CSP, health checks, and observability. Authentication, deployment, enabled AI/health integrations, telemetry vendors, and live database changes are out of scope.

## Acceptance criteria

- [x] AC-1: An automated browser accessibility test covers the starter home page; keyboard access to its interactive elements is tested. Document automated testing's limitations and any justified exceptions.
- [x] AC-2: A clearly isolated opt-in example demonstrates input validation, server-function boundary, repository access, error handling, and user feedback; a developer can follow documented instructions to run its relevant tests with a disposable test database. The default app has no business schema or mandatory database.
- [x] AC-3: Evaluate Bun-compatible dependency and secret scanning against current CI and Dependabot. Document the selected approach, coverage, false-positive handling, limitations, and a safe response process. Add checks only when their compatibility and maintainability are demonstrated; do not expose secrets or weaken existing checks.
- [ ] AC-4: Each item has relevant positive and negative verification, updated documentation, and recorded actual results. CI/dependency modifications receive high-risk review.
- [x] AC-5: Document six optional capabilities, including when to use them, security boundaries, and verification. Provide and test a configurable SEO metadata helper without connecting it to a route or hard-coding a project identity; clearly identify guidance that is not executable.

## Domain invariants

The starter has no business domain, authentication, or application schema. Domain logic stays pure; routes do not access persistence; server input and database rows are validated. The home page builds and runs without database credentials. Migrations are explicit and applied migrations are immutable.

## Plan

1. Accessibility (S): inspect `tests/e2e/home.spec.ts` and root/home routes. Select a compatible automated checker if justified, add home-page checks and keyboard assertions, and document manual review limits.
2. Example slice (M): design a minimal isolated example using existing `docs/PATTERNS.md` and backend boundaries. Establish how it is executed and cleaned up on a disposable database without changing the default app or adding an active migration. Include realistic success, validation, conflict, and unexpected-error cases as appropriate; avoid speculative framework abstractions.
3. Supply chain (M): inventory existing Dependabot, pinned actions, CI permissions and Bun lockfile; compare candidate tools and test them with synthetic findings and safe fixtures. Implement only well-understood checks with clear failure/remediation behavior and no privileged execution of untrusted PR code.
4. Deliver separate tasks/PRs for independent review, update documentation, perform the standards self-review, and record evidence.

## Verification plan

- AC-1: Run targeted Chromium E2E, including keyboard behavior; confirm a synthetic violation can be detected without weakening assertions. Run `bun run check` and applicable existing E2E.
- AC-2: Follow the documented setup from a clean checkout with a disposable `_test` database; run example unit, integration, and browser tests including failure cases. Run the existing production smoke without a database.
- AC-3: Demonstrate scanning with synthetic known-positive and clean fixtures, check behavior on scanner errors and false positives, and verify CI permissions and untrusted-PR handling. Never use real secrets as fixtures.
- AC-4: Run `bun run check`; run integration/E2E/production checks when relevant. Record actual commands, outcomes, and blockers. Review changed sensitive paths against the PR verifier.

## Compatibility and recovery

Accessibility tests and examples must not change the default runtime contract or require production services. Use only disposable test databases; no automatic migration against unknown targets. CI and dependency changes are high risk and require review; revert an individual change if it creates unreliable checks, without disabling unrelated protections. Git revert does not undo external effects.

## Decisions and questions

- User authorized implementation, including the optional capability catalog, and requested merge when complete.
- Select the example's isolation and execution mechanism after inspecting current test infrastructure; avoid an example that exists only as untested documentation.
- Scanner selection and whether checks should block are deferred until compatibility and false-positive behavior are demonstrated.
- Capabilities remain inactive until explicitly selected for a product or deployment.

## Evidence

Planning: reviewed product/domain/architecture, standards, patterns, workflow, safety, CI, package scripts, and recent history. Prior comparison inspected both neighboring projects.

Implementation in progress on `docs/template-essential-upgrade-plan`: added axe Playwright dependency and draft accessibility tests. No example slice or supply-chain CI changes have been implemented.

- `bun run check`: passed with Bun 1.4.4, not the pinned 1.4.2.
- `bun run test:e2e tests/e2e/accessibility.spec.ts`: failed before tests ran because Playwright Chromium was missing.
- `bun run playwright install chromium`: timed out twice during browser installation; no browser verification completed.
- `docker compose --profile test up -d --wait db-test`: failed because port 5433 was already in use. No existing database was accessed; Docker created but did not start the template test container.
- `bun audit --audit-level=high`: reported two existing high advisories: Vite GHSA-587h-7wmj-h5pm and Zod GHSA-mrhx-c7xc-m3w5. Applicability and fixes require review.
- No issue or PR created, and nothing merged. Resume by providing Chromium and a clearly isolated disposable test database on a free port, then complete the remaining criteria and required high-risk review.

Capability catalog implementation: added six opt-in guides, linked them from the README and start guide, and added a standalone SEO metadata helper with unit tests. The other five guides are not runnable integrations. The helper is not connected to a route; no application schema, network integration, deployment, or production configuration changed.

- `bun run check`: passed after formatting; 20 unit tests passed, plus policy tests, lint, build, and typecheck. Used Bun 1.4.4 rather than the repository pin 1.4.2.
- `bun run test:production`: passed without database credentials on Bun 1.4.4.
- `git diff --check`: passed for tracked changes; new files are untracked and were reviewed separately.
- Self-review: optional SEO code is pure and validates its origin/path inputs; no authentication, persistence, or server secrets were added. Browser verification of the separate accessibility change, the example slice, supply-chain evaluation, and pinned-runtime verification remain outstanding; do not merge as complete.

Follow-up verification:

- Ran `bun run test:e2e` using the existing Chromium headless shell revision 1255 through `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`: all 4 tests passed. This is not Playwright's expected revision 1208; CI must verify that revision.
- Started a separate temporary PostgreSQL container on an automatically allocated loopback port. `bun run test:integration` passed all 5 tests against its disposable `app_test` database; the database already using port 5433 was not touched.
- Updated the pinned Vite and Zod dependencies to 8.3.8 and 4.6.7, respectively. Bun 1.4.2 `audit --audit-level=high` reported no high or critical vulnerabilities and noted 3 lower-severity findings; the registry's data and applicability may change.
- Used the Bun 1.4.2 executable directly to run `bun run check`: passed. An earlier invocation through `bunx --bun` failed because its executable shim caused the policy test's `node` command to run under Bun; it is not a policy test failure under Node.
- Added supply-chain guidance but did not configure a secret scanner or verify synthetic scanner findings. The runnable vertical slice remains unimplemented. AC-2, AC-3, and AC-4 are not complete; do not present the task as complete or merge the unfinished work.

Further work: added an inactive example domain, repository, server function and form under `src/modules/example-widget/`, plus unit and PostgreSQL integration tests and adoption guidance. The form is not mounted in a route, so its browser/server-function flow has not been tested end to end. `bun run check` with Bun 1.4.2 passed after adding these files. Integration tests initially failed because restarting the disposable container allocated a new port; rerunning against its actual port passed all 6 tests. The temporary container was stopped. Secret-scanner evaluation and complete browser verification still remain; AC-2 through AC-4 remain incomplete.

Final local verification: `bun run verify` passed using Bun 1.4.2, an isolated disposable PostgreSQL container, and an existing Chromium revision 1255 through `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. The example browser test mounts the form only in a temporary application copy and verifies validation, successful creation, duplicate conflict, and safe unexpected-error feedback. Its test table is created only if absent and removed by the test; an interruption can leave it behind in the disposable database. CI must still verify the Playwright-pinned browser revision.

Gitleaks 8.24.3 evaluation: a clean synthetic fixture returned success, a generated synthetic GitHub-style token was detected with redacted output, and a missing configuration returned failure. This is not comprehensive coverage or false-positive evaluation; no secret scanner was enabled in CI. Dependency audit found no high/critical advisories at the time of testing, but three lower-severity advisories remain. The CI, dependencies, and scripts changes are high risk and need review; no production database, deployment, or secret was used.
