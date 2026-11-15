# Toolchain compatibility and CI diagnosis

Status: in-review
Risk: high
Issue: https://github.com/achmadya-dev/ai-project-template/issues/45
PR: https://github.com/achmadya-dev/ai-project-template/pull/46
Plan revision: 1
Authorization: user requested investigation and fixes for TypeScript 7, Node 26 types and GitHub Actions failures; no billing changes or production deployment authorized.

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

Node 24 is the declared test-tool runtime. Upgrading Node or using split TypeScript versions requires demonstrated compatibility; do not assume Node 26 types are valid on Node 24.

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
