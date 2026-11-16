# Visual documentation refresh

Status: in-review
Risk: high
Issue: https://github.com/achmadya-dev/ai-project-template/issues/49
PR: https://github.com/achmadya-dev/ai-project-template/pull/50
Plan revision: 1
Authorization: user requested clearer repository documentation using tables and Mermaid diagrams; no behavior, policy, deployment, or production data changes authorized.

## Goal

Make the existing architecture, workflows, database choices, verification, and recovery guidance easier for people and agents to navigate without changing the repository contract.

## Scope

Update selected current documentation with text-supported Mermaid diagrams, concise tables, and links. Correct stale migration documentation against the actual migration files. Preserve historical task records, templates, and normative rules.

## Acceptance criteria

- [x] AC-1: A documentation map helps readers find the correct source of truth and scope.
- [x] AC-2: Mermaid diagrams explain existing application boundaries and task lifecycle without inventing behavior or removing text alternatives.
- [x] AC-3: Tables clarify supported databases, local verification, and recovery risks based on the current implementation.
- [x] AC-4: Migration documentation accurately describes the existing auth migrations, explicit execution, and immutability requirements.
- [x] AC-5: Verify changed links, Mermaid syntax where tooling permits, and relevant checks; record limitations and perform the required self-review.

## Domain invariants

Documentation must not weaken authorization, database isolation, recovery, or review requirements. SQLite remains the default, migrations remain explicit, and test databases must be independently verified disposable targets.

## Plan

1. Inspect the existing documentation and relevant implementation.
2. Add text-supported diagrams and tables only where they clarify actual behavior.
3. Validate links and diagrams, run relevant checks, and record evidence.

## Verification plan

Review the diff against the repository and implementation, check changed local links and diagram syntax, and run `bun run check`. Do not claim visual rendering or CI passed without testing it.

## Compatibility and recovery

Documentation-only changes do not migrate data or change runtime behavior. `docs/ARCHITECTURE.md` is verifier-classified sensitive; retain high-risk classification and review. A Git revert restores documentation only.

## Decisions and questions

Use English, preserve human-readable text alongside diagrams, and do not rewrite historical task evidence or agent governance.

## Evidence

- Initial inspection found that `db/migrations/README.md` and the README structure list incorrectly state that the starter has no executable application migrations, although provider-specific auth migrations exist.
- Confirmed provider migration paths, Compose services, auth handlers, package scripts, workflow and safety guidance against the repository. Corrected the migration descriptions without changing SQL or execution behavior.
- Parsed all 4 Mermaid diagrams using Mermaid 11 and a temporary jsdom environment. This validates syntax only; rendering in GitHub or other Markdown viewers was not visually verified.
- Checked relative Markdown links and heading anchors in the 8 updated existing documents with a temporary local script; all passed. `git diff --check` passed.
- `bun run check` passed with Bun 1.4.2 and Node 26.13.0. No database or browser test was run for this documentation-only change; hosted CI was not verified.
- Self-review: diagrams have accompanying prose or existing text alternatives, do not grant authorization or imply enforced workflow states, and preserve the existing security, review, migration and recovery requirements. Historical task evidence and agent rules were not rewritten. Architecture documentation is high risk under the PR verifier.
