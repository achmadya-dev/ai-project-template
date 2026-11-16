# Safety boundaries

## What is actually checked

- TypeScript, lint, and tests when the local verification commands are run; these are not hosted checks.
- Portable Kysely example coverage for SQLite, PostgreSQL and MySQL, including row validation and provider-specific constraint handling.
- Production smoke test: the home page is available without database credentials.
- Migration checksums for migrations already applied by the runner.
- Admin-only provisioning, public signup denial, authenticated session behavior and origin checks in local auth tests.
- Pull request metadata and sensitive-path hints when the verifier from the trusted base revision is run locally.

## What is not enforced

`AGENTS.md`, runbooks, risk labels, pull request checkboxes, and local Git hooks do not restrict credentials or prevent every unsafe action. Agents can make mistakes, and the repository does not isolate the user's computer. GitHub rulesets are not enabled just because these files exist. Pull requests can also change tests and dependencies; governance changes need review.

## Risk levels

- Low: narrow changes that do not affect data, access, or contracts.
- Medium: ordinary feature logic with localized impact.
- High: authentication, tenancy, money, critical inventory, migrations, dependencies, CI, governance, or external side effects.

The path heuristic in `check-pr` is a minimum, not a complete risk classification. High risk does not mean work is permanently blocked; it requires review and authorization appropriate to the action. Do not repeatedly ask for approval for reversible work that is already authorized.

## Credentials

Coding agents need repository/branch access and a disposable database for integration tests. Do not provide production credentials. Run workers without unnecessary personal credentials. Do not expose the development server to the internet. These are tool/host settings that cannot be enforced by this repository.

## Local verification

No GitHub Actions workflow runs the tests or PR verifier. Run `bun run verify` locally and record the tested commit and results in the PR; run optional provider suites only against separately verified disposable databases. Reviewers should inspect the evidence and diff, especially when tests or verification scripts changed. Run the metadata verifier from a trusted base revision rather than a version a PR can replace. Git hooks and self-reported results can be bypassed and do not establish independent verification.

## Migrations

PostgreSQL and SQLite migrations run transactionally; the PostgreSQL runner does not support `CREATE INDEX CONCURRENTLY`. MySQL DDL can commit independently: only one statement is supported per file, and an incomplete attempt blocks later runs until manually reviewed. Never blindly remove the attempt marker. Large backfills and non-transactional operations need a separate plan. Do not run automated resets or drops. Test compatibility between old and new application versions when a real migration is introduced.

## Authentication

Better Auth is self-hosted; public signup and OAuth are disabled. The first administrator is created only by an explicit interactive local command, after migrations. A durable singleton guard prevents concurrent bootstrap attempts; a failed attempt deliberately requires manual inspection. HTTP auth endpoints are allowlisted and reject untrusted or missing origins for state-changing requests. TanStack server-function CSRF protection remains enabled.

The default database-backed rate limiter uses a shared counter when no trusted client IP is configured. It is conservative but can throttle unrelated users and is not a complete DDoS defense. Configure trusted proxy headers and edge protection for the actual deployment after security review; never trust arbitrary forwarded headers. Email verification, self-service recovery, external credential delivery, MFA, and business-specific authorization are not implemented.
