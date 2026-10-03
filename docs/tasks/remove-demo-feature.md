# Remove the default catalog demo

Status: in-review
Risk: high
Issue: https://github.com/achmadya-dev/ai-project-template/issues/24
PR: not-created
Plan revision: 1
Authorization: user requested removal of the demo feature in this repository.

## Goal
Leave the template landing page and backend foundations without shipping a sample business feature.

## Scope
Remove the catalog screen, server functions, domain/repository code, demo policy/configuration, and feature-specific tests/docs. Keep the generic database adapter, migration runner, template landing page, and relevant infrastructure checks.

Out of scope: dropping or rewriting `db/migrations/001_catalog.sql`, removing its database table, or changing existing database data. The migration may already be applied and is immutable; a schema drop requires a separately reviewed, explicitly authorized forward migration.

## Acceptance criteria
- [x] AC-1: The home page only shows the template landing/workflow content; there is no catalog form, item list, or catalog server endpoint/module.
- [x] AC-2: The app has no `DEMO_ENABLED` config or development demo policy; the home page and production artifact work without database credentials.
- [x] AC-3: Backend database/migration tests remain meaningful, and browser/production smoke checks verify the app shell without relying on the removed feature.
- [x] AC-4: Current setup and architecture docs describe no built-in business feature and clearly preserve the historical catalog migration/data.

## Domain invariants
No business domain is provided by the template after this change. Keep migration history immutable and do not modify/drop existing database state.

## Plan
1. Remove catalog UI/module/demo configuration and replace catalog-specific browser/unit coverage with shell/backend-core coverage.
2. Preserve generic PostgreSQL and migration integration checks without depending on the catalog application module.
3. Update current setup/product/domain/safety docs and record historical schema compatibility.
4. Run `bun run check` and `bun run verify` where the disposable PostgreSQL/browser prerequisites are available; self-review the final diff.

## Verification plan
- AC-1: E2E home-page assertions; source/module and route checks.
- AC-2: Environment unit tests and production smoke with empty `DATABASE_URL`.
- AC-3: PostgreSQL integration suite covers adapter behavior and migration checks; browser smoke covers the home page.
- AC-4: Review README, product/domain/architecture/pattern/safety/recovery docs and this task.

## Compatibility and recovery
Removing the catalog app code is reversible through source control. The immutable `001_catalog.sql` migration remains in history, and no schema/data operation is run. Existing databases keep any catalog table/data; fresh `db:migrate` still applies the historical migration. A future schema retirement needs a separate forward migration and explicit authorization.

## Decisions and questions
Routine assumption: “hapus fitur demo” means remove the shipped catalog behavior and demo flag, not destructively delete schema/data. No product replacement is in scope.

The repository's PR verifier classifies changes to `docs/ARCHITECTURE.md`, `docs/CODE_STANDARDS.md`, and `docs/PATTERNS.md` as high risk. Any future PR for this task must keep `Risk: high` and receive the repository's required review.

## Evidence
- `bun run format`: passed.
- `bun run verify`: passed on Bun 1.4.2 — policy 12/12, unit 12/12, PostgreSQL integration 5/5, E2E 1/1, production smoke HTTP 200 without DB credentials; format, lint, build, and typecheck also passed.
- GitHub issue: https://github.com/achmadya-dev/ai-project-template/issues/24.
- Verification used the repo's `db-test` Compose service (`tmpfs`, localhost port 5433); the service was stopped after the run. E2E used the already-cached Chromium executable via `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; the documented browser install command timed out twice in this environment. No browser/dependency changes were committed.
- `git diff --check`: passed.
- Build emitted existing upstream Nitro/Rolldown module-directive warnings; checks still passed.
- `db/migrations/001_catalog.sql` was not edited, removed, or applied to any persistent user database. No database objects or data were deleted.
- An untracked local `dev.sqlite` appeared during the session; it was left untouched and is not part of this task.
