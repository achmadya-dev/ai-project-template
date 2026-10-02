# Bun package manager migration

Status: in-review
Risk: high
Issue: https://github.com/achmadya-dev/ai-project-template/issues/8
PR: see linked pull request on issue #8
Branch: chore/bun-package-manager
Plan revision: 1
Authorization: owner requested “bisakah gunakan bun jangan npm?” in the coding session.

## Goal and acceptance criteria
- AC-1: Bun 1.4.2 is pinned, text lockfile migrated and reproducible from a clean install.
- AC-2: Current scripts, hooks, agent commands, setup and CI use Bun; Node 24 application runtime remains compatible.
- AC-3: Dependabot uses the Bun ecosystem; low-risk PR metadata is rejected for Bun lock/config changes.
- AC-4: Lint, policy/unit tests, build/types and production smoke pass locally; PostgreSQL and browser checks run in hosted CI.
- AC-5: Actual evidence and recovery are documented with linked GitHub issue/PR.

## Changes and risk
No application, schema or direct dependency version changes. CI, lockfile, scripts and governance instructions change, requiring high-risk review. Added regression tests strengthen sensitive-path classification for bun.lock, bunfig.toml and .bun-version. No tests weakened. The trusted-base PR verifier remains unchanged in the workflow.

## Evidence
See docs/VALIDATION.md and linked PR checks. Clean frozen install and local quality/production checks passed. Hosted DB/browser checks must pass before merge.

## Compatibility and recovery
Revert the migration commit, restore the original package-lock.json and reinstall the original dependencies if required. There are no database changes or external side effects to undo. Do not mix package managers or commit multiple lockfiles. Retain both .bun-version and packageManager at the same version when upgrading Bun.
