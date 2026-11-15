# Toolchain compatibility and CI diagnosis

Status: in-review
Risk: high
Issue: https://github.com/achmadya-dev/ai-project-template/issues/45
PR: https://github.com/achmadya-dev/ai-project-template/pull/46
Plan revision: 3
Authorization: user requested investigation and fixes for TypeScript 7 and GitHub Actions failures, then explicitly requested upgrading the tooling runtime and types to Node 26 and using TypeScript 6 alone; no billing changes or production deployment authorized.

## Goal

Find a supported, locally verified toolchain configuration without weakening lint, type checks, or CI, and identify the action needed to restore hosted CI.

## Scope

Investigate TypeScript and typescript-eslint compatibility, Node runtime and type version alignment, and GitHub Actions failure annotations. Do not alter billing, bypass protections, or deploy.

## Acceptance criteria

- [x] AC-1: Reproduce the TypeScript 7 lint failure and evaluate a supported solution; adopt only a configuration that preserves the lint and typecheck contracts.
- [x] AC-2: Ensure Node types do not promise APIs unavailable in the configured Node runtime; test any proposed changes against the actual runtime.
- [x] AC-3: Identify the hosted CI blocker using job evidence and describe any user action required; do not claim hosted CI passes without a successful run.
- [x] AC-4: Run relevant local checks, document actual versions, risks and limitations, and review sensitive dependency/configuration changes.

## Domain invariants

Tooling must not weaken application validation, authorization, security controls, lint or type safety. Bun remains the application runtime.

## Plan

1. Reproduce the known TypeScript failure and inspect upstream compatibility.
2. Evaluate supported alternatives and Node runtime alignment in an isolated installation.
3. Verify proposed changes locally and record hosted CI status and remaining blockers.

## Verification plan

Run lint, typecheck, `bun run check`, and applicable tests using the declared toolchain. Check hosted job annotations without changing billing or weakening checks.

## Compatibility and recovery

Dependency and tooling changes are high risk. Keep pinned lockfile versions, document exact tested runtimes, and revert the toolchain changes together if incompatibilities emerge.

## Decisions and questions

Node 26 is the explicitly requested test-tool runtime. The original Node 24 verification below is historical evidence; validate the updated Node 26 runtime and types together.
The user subsequently chose TypeScript 6 alone rather than a split TypeScript 6/7 toolchain; the split-compiler evidence below is historical.

## Evidence

- GitHub Actions job 132987426227 reports: "The job was not started because your account is locked due to a billing issue."
- Registry metadata for typescript-eslint 8.72.2 reports a TypeScript peer range of `>=4.8.4 <6.1.0`; the current project uses typescript-eslint 8.71.0 and TypeScript 5.9.3.
- Current local baseline: Bun 1.4.4, Node 26.13.0; `bun run lint` passes with the existing TypeScript version.
- On an isolated copy, installing TypeScript 7.0.2 directly made `bun run lint` fail with `typescript-eslint does not support TS 7.0`. The upstream TypeScript 7 announcement recommends using the TypeScript 6 compatibility API alongside the native compiler: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6-0.
- Installed `typescript` as the `@typescript/typescript6` 6.0.2 compatibility package and `@typescript/native` as TypeScript 7.0.2; the compatibility package resolves the TypeScript 6.0.3 API. Both `tsc --noEmit` and `tsc6 --noEmit` are required by `bun run typecheck`. ESLint continues to use the TypeScript 6 API. The native compiler adds platform-specific optional binaries; only Linux x64 was verified locally.
- Updated `@types/node` to 24.19.2 while retaining the declared Node 24 runtime. Node 26 types were not adopted because they could permit APIs unavailable in Node 24.
- With Bun 1.4.2 and Node 24.22.3, `bun install --frozen-lockfile` and `bun run verify` passed. Browser tests used local Chromium revision 1255 through `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; the Playwright-pinned browser was not verified. A synthetic incorrect assignment was rejected by both TypeScript 7.0.2 and TypeScript 6.0.3. `bun audit --audit-level=high` found no high or critical findings and reported three lower-severity findings.
- Self-review: changes are limited to the test/compiler toolchain and documentation; existing lint, type checking, policy tests and security controls remain enabled. Hosted CI remains blocked until the GitHub account owner resolves billing; no GitHub-hosted run was claimed to pass.
- Account owner action: review the relevant account or organization billing settings in GitHub and contact GitHub Support if the lock persists. Once resolved, re-run the failed workflow and inspect all results; do not modify payment details or bypass the hosted checks from this task.
- Plan revision 2: at the user's explicit request, changed `.nvmrc` from Node 24 to Node 26 and upgraded `@types/node` to 26.6.6. Bun remains the application runtime. Updated the architecture, setup guidance, agent instructions, and doctor hint; historical Node 24 results above describe the earlier revision.
- With Bun 1.4.2 and Node 26.13.0, `bun install --frozen-lockfile` and `bun run verify` passed, including both TypeScript compilers, 27 unit tests, 5 SQLite integration tests, 4 home E2E tests, 1 example E2E test, 1 auth E2E test, and production smoke. Chromium revision 1255 was used instead of Playwright's pinned revision 1243.
- On separately verified disposable database containers, PostgreSQL integration passed 7 tests and MySQL integration passed 5 tests using Bun 1.4.2 and Node 26.13.0. `bun audit --audit-level=high` reported no high or critical advisories and three lower-severity findings.
- Node 26 and TypeScript 7 are tooling and dependency changes with high risk; hosted CI and native compiler platforms other than Linux x64 remain unverified. No tests or security checks were disabled.
- Plan revision 3: the user explicitly chose TypeScript 6 only. Replaced the side-by-side setup with the regular `typescript` 6.0.3 package, removed the TypeScript 7 native compiler and compatibility alias, and changed `typecheck` to run the single TypeScript 6 compiler. This intentionally removes the additional TypeScript 7 comparison, not lint or the existing TypeScript type-check requirement.
- With Bun 1.4.2 and Node 26.13.0, `bun install --frozen-lockfile`, `bun run typecheck`, and `bun run verify` passed on the single-compiler configuration. The verification includes 27 unit tests, 5 SQLite integration tests, 4 home E2E tests, 1 example E2E test, 1 auth E2E test and production smoke. Tests used Chromium revision 1255, not the Playwright-pinned revision 1243. `bun audit --audit-level=high` found no high or critical advisories and three lower-severity findings. Hosted CI remains blocked by billing.
