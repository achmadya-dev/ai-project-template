# Bootstrap AI project template

Status: uploaded; hosted CI pending
Risk: high
Issue: https://github.com/achmadya-dev/ai-project-template/issues/1
PR: not-created (initial bootstrap)
Plan revision: 1
Authorization: user explicitly requested this single-project boilerplate in the conversation.

## Goal
Deliver one fullstack base repository for planning through prompts and implementing tasks with an agent chosen by the user.

## Scope
TanStack application, PostgreSQL development example, portable agent instructions, planning/implementation/review runbooks, task files, GitHub templates/CI, verification, and usage documentation. Cross-project orchestration and worker provisioning are out of scope.

## Acceptance criteria
- [x] AC-1: A clean dependency install, production build, lint, and typecheck work.
- [x] AC-2: A development user can create an item, reload it, and receive duplicate-SKU feedback.
- [x] AC-3: The database enforces uniqueness under concurrent writes.
- [x] AC-4: Production output disables demo access even when runtime environment flags request development.
- [x] AC-5: Agent instructions and task workflow are portable; vendor adapters refer to one canonical agreement.
- [x] AC-6: PR templates and CI checks are provided, with honest instructions for external GitHub protection.

## Invariants
SKU normalization and uniqueness; applied migrations are immutable; no production credentials or real integrations; no automatic merge/deploy.

## Implementation
See README, AGENTS.md, docs/ARCHITECTURE.md, and docs/WORKFLOW.md. Initial bootstrap creates the baseline before a remote PR workflow exists.

## Verification evidence
See docs/VALIDATION.md for executed commands, counts, runtime, and limitations. Browser testing found and fixed a pre-hydration native form submission and an invalid HTML pattern; the E2E test now checks persistence, duplicates, client errors, and mobile overflow.

## Compatibility and recovery
New repository only. Database migration is additive. No production migration or external effect executed. Recovery for future projects is documented, not provisioned.

## Remaining external setup
Repository and bootstrap issue now exist. Configure required checks/rulesets after hosted CI succeeds. This initial bootstrap has no historical PR.
