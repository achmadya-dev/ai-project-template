# Safety boundaries

## What is actually checked

- TypeScript, lint, and tests through CI.
- PostgreSQL adapter row validation, cardinality, transactions, and constraint mapping.
- Production smoke test: the home page is available without database credentials.
- Migration checksums for migrations already applied by the runner.
- Pull request metadata and sensitive-path hints from the verifier at the base revision.

## What is not enforced

`AGENTS.md`, runbooks, risk labels, pull request checkboxes, and local Git hooks do not restrict credentials or prevent every unsafe action. Agents can make mistakes, and the repository does not isolate the user's computer. GitHub rulesets are not enabled just because these files exist. Pull requests can also change tests and dependencies; governance changes need review.

## Risk levels

- Low: narrow changes that do not affect data, access, or contracts.
- Medium: ordinary feature logic with localized impact.
- High: authentication, tenancy, money, critical inventory, migrations, dependencies, CI, governance, or external side effects.

The path heuristic in `check-pr` is a minimum, not a complete risk classification. High risk does not mean work is permanently blocked; it requires review and authorization appropriate to the action. Do not repeatedly ask for approval for reversible work that is already authorized.

## Credentials

Coding agents need repository/branch access and a disposable database for integration tests. Do not provide production credentials. Run workers without unnecessary personal credentials. Do not expose the development server to the internet. These are tool/host settings that cannot be enforced by this repository.

## CI

CI uses read-only tokens and no deployment secrets. Pull request metadata is treated as data, not interpolated into shell commands. The metadata verifier is loaded from the base SHA rather than a version that the pull request can replace. Avoid checking out untrusted code in privileged `pull_request_target` or `workflow_run` jobs. Other checks still require review because workflows and tests are source code in this repository.

## Migrations

The migration runner supports transactional SQL only; it does not support `CREATE INDEX CONCURRENTLY`. Lock and statement timeouts prevent indefinite waits. Large backfills and non-transactional operations need a separate plan. Do not run automated resets or drops. Test compatibility between old and new application versions when a real migration is introduced.
