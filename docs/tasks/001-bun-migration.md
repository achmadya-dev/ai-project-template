# Bun package manager and runtime migration

Status: in-review
Risk: high
Issue: https://github.com/achmadya-dev/ai-project-template/issues/8
PR: see linked pull request on issue #8
Branch: chore/bun-package-manager
Plan revision: 2
Authorization: owner first requested Bun instead of npm, then clarified that the application runtime should also be Bun.

## Goal and acceptance criteria
- AC-1: Bun 1.4.2 is pinned, text lockfile migrated and reproducible from a clean install.
- AC-2: Development/build/production application paths use Bun and Nitro preset `bun`; Node is not the application runtime.
- AC-3: Node 24 may remain only where current upstream test tooling (Vitest/Playwright) explicitly requires it; this must be documented rather than presented as the app runtime.
- AC-4: Dependabot uses the Bun ecosystem; low-risk PR metadata is rejected for Bun lock/config changes.
- AC-5: Lint, policy/unit tests, Bun build/types and Bun production smoke pass; PostgreSQL and browser checks run in hosted CI.
- AC-6: Actual evidence and recovery are documented with linked GitHub issue/PR.

## Changes and risk
No application behavior, schema or direct dependency version changes. CI, lockfile, runtime target, scripts and governance instructions change, requiring high-risk review. Nitro changes from the Node server preset to the Bun preset, dev/build use Bun for Vite, and production smoke explicitly verifies that the built server is launched by Bun. Existing regression tests continue to protect sensitive Bun lock/config paths. No tests are weakened. The trusted-base PR verifier remains preserved.

## Evidence
See docs/VALIDATION.md and linked PR checks. The earlier package-manager-only revision passed hosted quality, DB/browser, build and production smoke. The final Bun-runtime revision must pass the same checks again before merge.

## Compatibility and recovery
Revert this PR to restore the original npm/Node baseline and `package-lock.json` if required. There are no database changes or external side effects to undo. Do not mix package managers or commit multiple lockfiles. Retain both `.bun-version` and `packageManager` at the same version when upgrading Bun.
