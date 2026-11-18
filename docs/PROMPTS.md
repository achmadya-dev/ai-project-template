# Reusable prompts

Name the issue or task when one exists; there is no need to repeat every repository rule.

## Ordinary request (default)

Say what outcome you want in plain language, for example: "Fix the account form error when the server is unavailable." The agent follows `AGENTS.md`: it records criteria, works on a branch, tests locally, and prepares a PR for a clear authorized change without asking you to restate each workflow step. Say "plan only" or "review only" to stop before implementation. Merge, deployment, and real database changes are separate decisions.

## Kickoff

Read `AGENTS.md`. This project is for [users] and should solve [problem]. Propose one MVP workflow with a narrow scope. Update `docs/PRODUCT.md` and `docs/DOMAIN.md`. Create a planning issue if GitHub access is available; otherwise, use `docs/tasks/TEMPLATE.md`. Ask only about material unresolved decisions. Do not implement yet.

## Plan a feature

Read `AGENTS.md` and the relevant code. Plan [feature], including acceptance criteria, failure examples, invariants, database/API impact, and verification. Save the plan as a GitHub issue or a local task created from the template. Do not change application code yet.

## Plan with a prototype

For a plan that needs visuals: "Plan [feature/page] only. Follow `docs/PROTOTYPING.md`: create a small local prototype under `prototypes/[task-slug]/` if it answers a design question, attach labeled concept screenshots to the issue, record assumptions and the proposed decision, then stop. Do not change application code or push prototype source."

## Implement with UI evidence

Implement the accepted revision of [issue or task path]. Continue through relevant verification and a ready-to-review pull request. For UI changes, attach actual application screenshots to the PR or a linked PR comment with page/state and viewport context; do not substitute planning concepts. Record actual results and limitations. Do not merge or deploy. If GitHub access is unavailable, keep the plan and pull request body locally and report what remains.

## Review

Review this branch's diff against `main` and the acceptance criteria in [task]. Prioritize bugs, regressions, security, and domain rules. Check whether tests could pass while behavior is still wrong. Report evidence and locations; do not change code yet.

## Continue in a new session

Read `AGENTS.md`, `docs/HANDOFF.md`, [task path], Git status, and the branch log. Summarize the current state, then continue authorized work. Do not overwrite uncommitted changes or treat every handoff claim as verified.

## Fix a failure

Investigate [CI/test/sanitized log failure]. Find the root cause and fix it within the accepted contract. Add a regression test when useful. Do not remove or weaken tests to get a passing result.
