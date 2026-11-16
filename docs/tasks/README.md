# Local task records

Use [`TEMPLATE.md`](TEMPLATE.md) only when a GitHub issue is unavailable or when a versioned local plan contains information that the issue and PR cannot reasonably carry. For normal work with GitHub access, the issue owns scope and acceptance criteria, and the PR owns the changed behavior and verification evidence. Do not create a second task file merely to mirror their status.

When GitHub becomes available, the agent transfers the local task's unique criteria and evidence to the issue/PR and removes a redundant local record in the same task branch before merge. Promote any durable decision or safety procedure to `docs/adr/`, `docs/ARCHITECTURE.md`, or a runbook instead of deleting that knowledge. If a local task must remain, keep its status accurate without requiring users to manage it. A closed issue is not proof of deployment or that a historical test result still applies to current code.

This template does not ship completed task logs. Start each project with its own task records. Never copy credentials, customer data, or full logs into a task or PR.
