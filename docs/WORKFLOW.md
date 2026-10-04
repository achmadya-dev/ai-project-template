# Single-project workflow

## Sources of truth

Code and repository documentation describe the current system. Issues capture requests and discussion; pull requests capture changes and evidence. Use `docs/tasks/TEMPLATE.md` to create a versioned local task when GitHub is unavailable. Link these records instead of duplicating information that will quickly go stale.

## Task states

`draft` → `ready` → `in-progress` → `in-review` → `done`; use `blocked` when a decision or access prevents progress. A task status is a record, not an enforcement mechanism. `ready` means the acceptance criteria are clear enough and the user has authorized that scope.

## Planning

1. Read the product/domain context, related code, Git status, and relevant tests.
2. Define the outcome, scope, invariants, numbered acceptance criteria, risks, steps, and verification.
3. Ask only about material choices. Record routine assumptions.
4. Create a GitHub issue or a local task from the template. Record the plan revision and source of authorization; never invent approval.
5. Update the plan when material scope changes. Earlier authorization does not automatically apply to new scope.

## Implementation

1. Keep one task per branch and preserve existing user changes.
2. Implement a small, testable slice. Tests must prove expected behavior and important failure cases.
3. Run `bun run check` and relevant database/browser checks. For database-backed full-stack changes, run `bun run verify` when the disposable test prerequisites are available.
4. Update domain, ADR, or runbook documents when behavior or the architecture contract changes.
5. Record actual commands, results, limitations, and the revision tested. Explain failures; do not weaken tests.
6. Use the commit format in `docs/COMMITS.md`. Keep unrelated changes in separate commits.
7. Before opening a pull request, read `.github/PULL_REQUEST_TEMPLATE.md` and `scripts/check-pr.mjs`, then inspect the final changed-file list against the verifier's sensitive-path rules.
8. Use the repository pull request template. Link a real issue with `Closes #123`, set `Risk: low|medium|high` based on the actual diff, and complete every verified section: Goal, Changes, Verification, Compatibility and recovery, and Documentation.
9. If the verifier classifies any changed path as sensitive, use `Risk: high` and follow the repository review policy. Never lower the risk, change the verifier, or weaken CI to get a passing result.

## Commits

Use Conventional Commits as described in `docs/COMMITS.md`:

```text
<type>(<scope>): <description>
```

Examples:

```text
feat(auth): add password reset flow
fix(api): reject malformed pagination cursor
refactor(domain): extract order pricing policy
docs: clarify local setup
```

Mark breaking changes with `!` or a `BREAKING CHANGE:` footer. AI agents follow the same rules and must not put prompts, secrets, or user data in commit messages.

## Review and merge

The PR verifier checks metadata structure and some sensitive paths. Reviewers check substance, acceptance criteria, tests, and domain impact. CI is not proof of security. The template enables no automatic approval, auto-merge, or deployment.

`pr-contract` is the executable metadata contract. The pull request template is the starting point; check the body and changed-file list against `scripts/check-pr.mjs` from the trusted base revision before submitting. If the contract fails, correct the metadata or scope; do not bypass the verifier.

Repository owners must enable GitHub rulesets. If you are the only human contributor, see the solo workflow in `docs/GITHUB_SETUP.md`; do not add a fake reviewer to satisfy a rule.

## Handoff

Before switching sessions, fill in `docs/HANDOFF.md` with the task, branch, latest commit, uncommitted files, test results, blockers, and next step. Do not store secrets or a full chat transcript.

## Definition of done

Acceptance criteria are met and supported by evidence, changes stay in scope, relevant checks are complete or blockers are explicit, documentation is accurate, and issues/pull requests are linked when available. If GitHub is unavailable, report that external work as pending rather than claiming an issue or pull request exists.
