# Single-project workflow

## Sources of truth

Code and repository documentation describe the current system. Issues capture requests and acceptance criteria; pull requests capture changes and verification evidence. Use `docs/tasks/TEMPLATE.md` for a versioned local plan when GitHub is unavailable, or when an issue cannot carry a necessary local plan. Do not commit completed task logs into the starter by default; see `docs/tasks/README.md`. Link records instead of duplicating information that will quickly go stale.

## Progress without status bookkeeping

The agent owns routine progress records. An open issue holds the scope, an open PR holds the change and verification, and a merged PR closes its linked issue when `Closes #...` is used. Do not require a Project board, labels, manual state transitions, or status-only commits. When blocked, the agent records the reason and next action in the issue or local task and tells the user what decision or access is needed. A retained local task may use its `Status` field, but it is a truthful note, not a separate workflow gate.

The agent works during an active request, not as an unattended background service. The user supplies the outcome and decides material unknowns, merge for each PR, and other external or irreversible actions.

| Work mode | Main outcome | Do not assume |
| --- | --- | --- |
| Plan | Accepted scope and recorded acceptance criteria | Planning authorizes implementation |
| Implement | Working change and actual verification evidence | Passing tests authorize a merge or deployment |
| Review | Prioritized findings with evidence | Review authorizes silent implementation |

## Default path for natural-language requests

The user may simply describe an outcome, such as "Let an administrator export their own account data" or "Fix the account form error." The agent handles routine workflow steps without asking for each one. These are instructions to coding agents, not permission to take external actions beyond the request.

1. **Route the request.** A question gets an answer; "plan/design only" produces a plan without application changes; "review" reports findings without fixes. A clear request to build/fix/refactor authorizes the corresponding reversible work. Read `AGENTS.md`, product/domain context, Git status, the nearest implementation, and the relevant runbook. A user's "do it" is not a substitute for undecided business rules.
2. **Establish the task.** Reuse a matching issue or task; otherwise prefer a real same-repository issue when GitHub access is available, or create a local `docs/tasks/` record when it is not. Use both only when a durable local plan adds value, and link them instead of duplicating details. Write the goal, numbered acceptance criteria, risk, verification, compatibility, and any material unknowns before changing application behavior. Proceed when the authorized scope is clear; ask only about material unknowns. If GitHub is unavailable, keep truthful local links (`not-created`) and continue authorized work where possible.
3. **Work without extra ceremony.** For implementation, create/use one task branch from the appropriate base (not `main`), implement the smallest complete change, add relevant tests, and run the checks. Ask about decisions affecting data, money, access, scope, or external side effects before acting on them. Do not create duplicate issues, overwrite user changes, or request routine approval again. A plan-only or review-only request stops before this step.
4. **Prepare review.** Record the tested revision, actual command results, failures, and limitations in the issue/PR or local task. Inspect the final diff and sensitive paths, verify the PR body with the trusted-base `scripts/check-pr.mjs`, and create a PR using `.github/PULL_REQUEST_TEMPLATE.md` if access and authorization exist. If a PR cannot be created, provide a local handoff rather than a fabricated link. Transfer any local-only evidence into the issue/PR and remove a redundant local task on the same branch before merge. Git hooks and self-reported local results are not hosted CI or independent approval.
5. **Finish only when appropriate.** Respond to review feedback on the same branch; re-run affected tests after changes. Ask for explicit permission to merge each PR; deployment, production migration, payment, and other destructive actions require action-specific authorization. The narrow post-merge task-branch cleanup in this workflow is the only branch-deletion exception. After an authorized merge, report the outcome and confirm the linked issue closed. If a decision or access blocks progress, record the blocker and next action without creating a new status workflow.

For example, "Fix the account form error" authorizes investigation, a regression test, the fix, local verification, and a reviewable PR without the user spelling out those steps. "Plan how to fix the account form error" stops after a plan. "Deploy the fix" is a separate action that requires a specific target and authorization. Agents may use a GitHub Project board if one is configured, but this repository does not require one.

## UI review evidence

When a change affects a user-facing interface, include representative screenshots in the PR description or in a linked PR comment. Identify the relevant page/state and viewport (for example, desktop and mobile when responsive behavior changed). Upload screenshots as GitHub attachments (for example, with `gh pr comment --attach`) and link the comment from the PR description if the images are in a comment. Keep the screenshots visible to reviewers; merely saying that screenshots were inspected is not visual evidence. Mark this section not applicable for changes with no user-facing UI impact.

Do not commit transient Playwright screenshots, test results, or generated UI captures by default. Keep those in ignored/local artifact storage and attach the selected evidence to the PR. Commit an image only when it is an intentional maintained product/design artifact with a clear source and update policy. An issue may hold product reference images or a completion link, but the PR is the source of review evidence.

## Task branch cleanup

The user must explicitly authorize merging each PR. Once that PR is confirmed merged, automatically clean up its linked task branch without asking again, but only after verifying all of the following:

- the branch is the task branch used for that PR and is not the default or a protected branch;
- no other open PR depends on that branch;
- the merge completed successfully and the branch's relevant work is present in the base branch; if the remote task branch still exists, its head must match the merged PR head;
- for a local branch, the working tree is clean, it is not checked out in any worktree, and `git branch -d` can remove it without force.

Delete only the eligible task branch, using normal non-force deletion. If any check is uncertain or deletion requires force, stop and ask. Stale, orphaned, unmerged, user-owned, or unrelated branches require explicit approval and a reviewed list before deletion. Do not perform a bulk cleanup based only on age or branch name. This policy does not authorize deleting any branches that predate or are outside the current task.

## Planning

1. Read the product/domain context, related code, Git status, and relevant tests.
2. Define the outcome, scope, invariants, numbered acceptance criteria, risks, steps, and verification.
3. Ask only about material choices. Record routine assumptions.
4. Create a GitHub issue or a local task from the template as appropriate. Reuse a matching record before creating another; create both only when a local plan adds value and link them. Keep durable decisions in their canonical documentation rather than in a task log. Record the plan revision and source of authorization; never invent approval.
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
9. If the verifier classifies any changed path as sensitive, use `Risk: high` and follow the repository review policy. Never lower the risk or change the verifier to get a passing result.

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

Run the PR verifier locally to check metadata structure and some sensitive paths. Reviewers check substance, acceptance criteria, tests, and domain impact. There is no GitHub Actions CI or automatic approval, auto-merge, or deployment. Local results are self-reported and do not provide an independent gate.

`scripts/check-pr.mjs` is the executable metadata contract, retained for local use. The pull request template is the starting point; check the body and changed-file list against the verifier from the trusted base revision before submitting. The CLI entry point expects `GITHUB_EVENT_PATH` with a pull-request event and both base/head revisions available locally; its `validatePr(body, files)` export can be used for a local check. Record the result and tested commit on the PR. If the contract fails, correct the metadata or scope; do not bypass the verifier.

Repository owners should configure the GitHub protections available to them and remove any required checks that no longer run. If you are the only human contributor, see the solo workflow in `docs/GITHUB_SETUP.md`; do not add a fake reviewer to satisfy a rule.

## Handoff

When interrupting unfinished work or handing it to another session, the agent records the task, branch, latest commit, uncommitted files, test results, blockers, and next step in `docs/HANDOFF.md` if the context would otherwise be lost. Do not create a handoff for a completed PR or store secrets or a full chat transcript.

## Definition of done

Acceptance criteria are met and supported by evidence, changes stay in scope, relevant checks are complete or blockers are explicit, documentation is accurate, and issues/pull requests are linked when available. If GitHub is unavailable, report that external work as pending rather than claiming an issue or pull request exists.
