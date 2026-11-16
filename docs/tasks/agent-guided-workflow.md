# Agent-guided workflow by default

Status: in-review
Risk: high
Issue: https://github.com/achmadya-dev/ai-project-template/issues/61
PR: https://github.com/achmadya-dev/ai-project-template/pull/62
Plan revision: 1
Authorization: user requested that agents guide ordinary requests through the repository workflow automatically, without requiring users to name each workflow step.

## Goal

Let a user describe an outcome in natural language while the agent handles routine planning, task tracking, branching, verification, and PR preparation. Retain explicit decisions for material unknowns and irreversible or external effects.

## Scope and acceptance criteria

- [x] AC-1: Instructions shared by supported coding agents define a default path for implementation requests and distinguish plan-only, review-only, and questions.
- [x] AC-2: Clear, authorized reversible work proceeds without repeated approval; material choices and production/data/access/external effects are not inferred.
- [x] AC-3: The agent reuses an applicable task/issue or creates a real record, moves it through accurate states, works on a task branch, and prepares a contract-compliant PR with actual local verification.
- [x] AC-4: Documentation gives users an ordinary-language example, makes the no-CI/manual-review boundary clear, and does not require a GitHub Project board or new integration.
- [x] AC-5: Relevant repository checks pass; unsupported external automation is described as a limitation rather than promised.

## Approach

Use the existing root `AGENTS.md` as the single default policy, with details and examples in `docs/WORKFLOW.md`. Existing Cursor, Copilot, and Claude adapters already point at the root guidance; do not duplicate it in vendor-specific rules or add a dependency or hook. Preserve the repository's manual merge and deployment boundaries.

## Verification and limits

Check the changed guidance against `docs/CODE_STANDARDS.md`, the closest workflow procedures, and the existing PR verifier. Run `bun run check` and `git diff --check`. No hosted CI, autonomous agent trigger, or GitHub Project board is introduced; agent instructions depend on the coding tool loading the repository guidance. No runtime, database, or product behavior changes.

## Evidence

- `bun run check` passed: format, lint, 16 policy tests, 36 unit tests, build, and both typechecks. `git diff --check` passed.
- Existing `.cursor/rules/project.mdc`, `.github/copilot-instructions.md`, and `CLAUDE.md` already point at `AGENTS.md`; no vendor-specific rule was added.
- Manual scenario review: a natural-language implementation request proceeds through issue/task, branch, local tests, and PR; "plan only" and "review only" stop before implementation; an unknown business rule blocks only the affected action; merge/deploy/real database work still needs action-specific authorization. Instructions do not execute autonomously outside an agent session, and local hooks can be bypassed.
- No application runtime or database test was run for this instruction/documentation-only change.
- PR #62 was opened for issue #61. High-risk review is pending; no merge or automatic deployment was performed.
