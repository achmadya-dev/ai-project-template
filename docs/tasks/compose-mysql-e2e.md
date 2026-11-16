# MySQL Compose and provider E2E setup

Status: in-review
Risk: high
Issue: https://github.com/achmadya-dev/ai-project-template/issues/47
PR: not-created
Plan revision: 1
Authorization: user requested MySQL development and test services in Compose and documented PostgreSQL/MySQL E2E setup. No production access or deployment authorized.

## Goal

Make the optional PostgreSQL and MySQL development and disposable test databases practical to start locally and document how to run provider-specific integration and browser tests.

## Scope

Add opt-in MySQL development and test services to `compose.yaml`, retain SQLite as the default, and document safe provider-specific test commands. Use only isolated disposable databases for verification.

## Acceptance criteria

- [x] AC-1: Compose offers a loopback-only MySQL development service with persistent storage and a separate disposable MySQL test service.
- [x] AC-2: PostgreSQL and MySQL test ports can be changed to avoid collisions; defaults and development data remain compatible.
- [x] AC-3: Documentation explains provider-specific integration and E2E commands, test isolation, cleanup and data-loss risks.
- [x] AC-4: Validate Compose configuration, run provider integration and E2E tests against verified disposable Compose databases, and record actual results and limitations.

## Domain invariants

Never run migrations or tests against unknown or production data. Test databases must be separate and disposable; a `_test` name alone is not sufficient proof. No application schema is automatically migrated.

## Plan

1. Add explicit MySQL services following the existing PostgreSQL service isolation pattern.
2. Document service selection, configuration, provider tests, and recovery limitations.
3. Start an isolated Compose project with non-conflicting test ports and run verification.

## Verification plan

Run `docker compose config`, start only the two test services in an isolated project, inspect their identity and published ports, and run provider integration plus example and auth E2E tests. Run `bun run check` and applicable local checks. Stop only the test services created for this task.

## Compatibility and recovery

Do not change or remove existing development volumes. MySQL development data is persisted separately. Test services use ephemeral storage and lose data when stopped; never point tests at development or production data. No schema rollback is implied by reverting Compose configuration.

## Decisions and questions

MySQL development is opt-in so the existing default Compose startup does not gain a mandatory service. Test ports are configurable while retaining the existing PostgreSQL test port by default.

## Evidence

- Before implementation, PostgreSQL test port 5433 was occupied by an unrelated container; it was not accessed.
- `docker compose --env-file /dev/null -p ai-template-e2e-verify --profile mysql --profile test config --quiet` passed.
- Started only `db-test` and `mysql-test` in the dedicated `ai-template-e2e-verify` project with loopback ports 15433 and 13308. Docker inspection confirmed the expected images, healthy services, project labels and `tmpfs` database storage. No pre-existing service or database was accessed.
- With Bun 1.4.2 and Node 26.13.0, PostgreSQL integration passed 7 tests and MySQL integration passed 5 tests. Example E2E and auth E2E passed once for each provider. Browser runs used Chromium revision 1255 instead of the Playwright-pinned revision 1243.
- Started the isolated project's opt-in MySQL development service on loopback port 13307; Docker inspection confirmed its separate named volume and healthy status, and a synthetic read-only query returned `app_dev`. The `app_dev` URL was rejected by the auth test configuration before any connection.
- `bun run check` and `bun run verify` passed with Bun 1.4.2 and Node 26.13.0; default SQLite integration and E2E used Chromium revision 1255 rather than the pinned revision 1243.
- Stopped and removed only the three containers created in the dedicated verification project, then removed its newly created synthetic MySQL development volume. Existing containers and volumes were not modified. No production data or services were accessed.
- Self-review: the existing PostgreSQL development volume and default port are unchanged; MySQL development is opt-in and uses a distinct persistent volume, while both test services use loopback-only published ports and ephemeral storage. Test scripts still require separate, verified disposable targets; `_test` is not sufficient evidence of isolation. No migration, application, auth, CI, or dependency behavior was altered. Hosted CI is not verified.
