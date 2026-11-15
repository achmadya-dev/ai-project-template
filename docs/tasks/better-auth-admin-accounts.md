# Better Auth with administrator-managed accounts

Status: in-review
Risk: high
Issue: https://github.com/achmadya-dev/ai-project-template/issues/39
PR: https://github.com/achmadya-dev/ai-project-template/pull/40
Plan revision: 1
Authorization: user requested Better Auth, username/email login, admin-only account creation and an explicit local first-admin bootstrap; no production access, migration or deployment authorized

## Goal

Provide self-hosted Better Auth with email/password and username/password login, no public signup, and an administrator-only account creation workflow. Keep OAuth disabled and preserve SQLite, PostgreSQL, and MySQL support.

## Scope

Include explicit reviewed provider migrations, secure configuration, login/logout and session enforcement, administrator-only user creation, and a local first-admin command that cannot create another first admin. No OAuth, public signup, self-service password reset, email delivery, tenant model, or production rollout.

## Acceptance criteria

- [x] AC-1: Public signup and unauthorized user creation fail at the server endpoint, including direct HTTP requests; an authenticated non-admin cannot create or promote users.
- [x] AC-2: An admin can create a user with a required email, username and password. Username and email uniqueness and validation are enforced across supported databases.
- [x] AC-3: A user can sign in using either username or email and password, restore a session, sign out, and access protected routes/server functions only with an authorized session. Wrong credentials and unauthenticated calls are rejected without sensitive details.
- [x] AC-4: A local-only explicit bootstrap command creates the initial admin without passwords in arguments, default passwords, logs, or public endpoints. Repeat and concurrent invocations cannot create multiple first admins. No automatic initialization or production access.
- [x] AC-5: Auth schema migrations are explicit, forward-only, and tested for SQLite, PostgreSQL and MySQL without rewriting existing migration history; default startup and unrelated template pages remain usable without auth secrets or a database.
- [x] AC-6: Test important negative cases, CSRF/origin enforcement, cookies, rate-limit behavior, and expected production environment configuration. Record results and security review; document no OAuth, recovery limitations, dependency and migration risks.

## Domain invariants

Admin-controlled provisioning is the only account creation path. Email is required and usernames identify users case-insensitively. Session and authorization decisions are server-side. Do not invent tenant or business-role rules, enable social providers, trust client-supplied roles, or use production credentials.

## Plan

1. Pin Better Auth and inspect the actual installed interfaces and its SQLite/PostgreSQL/MySQL adapter, plugin, migration, and cookie integration.
2. Design schema migrations and the server-only auth boundary, including a race-safe first-admin guard and generic login failure behavior.
3. Add the restricted HTTP handler and server-side authorization before any protected operation. Add the smallest usable sign-in and admin account-creation UI.
4. Test the direct HTTP boundary, bootstrap races, database uniqueness, auth/session lifecycle, and production build against isolated SQLite, PostgreSQL, and MySQL.
5. Update product/domain/architecture, setup, security/recovery guidance and evidence; perform required high-risk self-review.

## Verification plan

Use synthetic credentials and disposable database targets only. Run unit, integration, browser and production checks for the selected providers, including direct unauthorized requests and concurrent bootstrap attempts. Record untested providers and external CI limitations explicitly.

## Compatibility and recovery

Existing migration history remains immutable; add forward migrations only. Auth schema changes and credential/session data are not reversed by a code rollback. Preserve backups and do not reset databases. Prerequisite PRs #36 and #38 were squash-merged.

## Decisions and questions

OAuth, email verification and password-reset delivery are not configured. Account delivery and recovery need a project-specific secure process before production. The first admin is created by an explicit local command only when no admin exists; concurrent commands must not bypass this guarantee.

## Evidence

Initial inspection: no authentication exists. Better Auth documents a username plugin and admin plugin, TanStack Start handlers, and Kysely-backed relational adapters. External documentation was consulted; no dependency was installed and no migrations were run.

Follow-up verification on the in-progress worktree:

- `bun run check` passed as part of the pre-push hook during branch cleanup: formatting, lint, policy tests, 27 unit tests, build, and typecheck passed.
- `bun run test:integration` passed: 5 SQLite integration tests across 3 files.
- `bun run test:auth` could not start the browser with Playwright's pinned Chromium revision 1208 because it was not installed. Re-running with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` pointing to the locally available Chromium headless shell revision 1255 passed the single auth browser test. This does not verify the pinned browser.
- `bun run verify` passed with Bun 1.4.4 and Node 26, using that locally available Chromium revision: 27 unit tests, 5 SQLite integration tests, 4 home E2E tests, 1 example E2E test, 1 auth E2E test, policy checks, build, typecheck, and production smoke. These are not the pinned Bun 1.4.2, Node 24, or Chromium 1208 versions.
- Against freshly created disposable test containers, `bun run test:integration:postgres` passed 7 tests and `bun run test:integration:mysql` passed 5 tests. `bun run test:auth` passed separately with PostgreSQL and MySQL using Chromium revision 1255. These runs used synthetic credentials and no production data.
- The built Bun production application passed `AUTH_TEST_PRODUCTION=1 bun run test:auth` separately with SQLite, PostgreSQL, and MySQL using Chromium 1255. The first PostgreSQL attempt failed because the restarted disposable container received a new port; the retry against the verified new port passed.
- `bun audit --audit-level=high` found no high or critical advisories and reported three lower-severity advisories.
- Security self-review: public HTTP routes are allowlisted, state-changing auth requests require the configured origin, account creation checks the server-side session and admin role, usernames and email are normalized before provisioning, and bootstrap uses a durable singleton claim. Negative HTTP, cookie, session, origin, rate limit, and concurrent-bootstrap cases were tested locally. The shared rate limiter is not a substitute for edge abuse protection; recovery, credential delivery, MFA, tenancy, and audit require project-specific design. No independent security review was performed.
- GitHub Actions jobs for the prerequisite PRs failed before starting because GitHub reported an account billing lock; the user explicitly accepted local verification in place of CI. Local results are not CI or independent approval.
