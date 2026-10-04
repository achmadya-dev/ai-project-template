# Reusable prompts

Name the issue or task when one exists; there is no need to repeat every repository rule.

## Kickoff

Read `AGENTS.md`. This project is for [users] and should solve [problem]. Propose one MVP workflow with a narrow scope. Update `docs/PRODUCT.md` and `docs/DOMAIN.md`. Create a planning issue if GitHub access is available; otherwise, use `docs/tasks/TEMPLATE.md`. Ask only about material unresolved decisions. Do not implement yet.

## Plan a feature

Read `AGENTS.md` and the relevant code. Plan [feature], including acceptance criteria, failure examples, invariants, database/API impact, and verification. Save the plan as a GitHub issue or a local task created from the template. Do not change application code yet.

## Implement

Implement the accepted revision of [issue or task path]. Continue through relevant verification and a ready-to-review pull request. Record actual results and limitations. Do not merge or deploy. If GitHub access is unavailable, keep the plan and pull request body locally and report what remains.

## Review

Review this branch's diff against `main` and the acceptance criteria in [task]. Prioritize bugs, regressions, security, and domain rules. Check whether tests could pass while behavior is still wrong. Report evidence and locations; do not change code yet.

## Continue in a new session

Read `AGENTS.md`, `docs/HANDOFF.md`, [task path], Git status, and the branch log. Summarize the current state, then continue authorized work. Do not overwrite uncommitted changes or treat every handoff claim as verified.

## Fix a failure

Investigate [CI/test/sanitized log failure]. Find the root cause and fix it within the accepted contract. Add a regression test when useful. Do not remove or weaken tests to get a passing result.
