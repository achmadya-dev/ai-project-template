# AI agent orchestration

This file is the host-neutral source of truth for reusable project subagents.
Native agent definitions live beside it in the host-specific locations listed
below. T3Code is a client/control surface; it displays delegation exposed by
the selected backend and does not itself configure models or subagents.

## Model routing

- Keep the primary session's selected model as the source of truth.
- Do not pin provider IDs, model IDs, model aliases, or reasoning effort in
  project subagent definitions.
- Subagents should inherit the active parent/session model whenever the host
  supports inheritance. If a host chooses a built-in model for a built-in
  subagent, leave that host default unchanged.
- Model selection remains a user/session preference; this repository does not
  configure credentials, providers, or personal model availability.

## Roles and delegation

| Role | Responsibility | Writes |
| --- | --- | --- |
| `explorer` | Map code paths, locate relevant tests/docs, and return concise evidence and file references. | No |
| `reviewer` | Independently inspect a proposed diff for correctness, regressions, security, and test gaps; report actionable findings by severity. | No |

The primary agent owns scope, decisions, implementation, integration, and final
verification. Delegate context-heavy exploration and independent review to
keep the primary context focused. Run independent read-only investigations in
parallel when useful; give every subagent a bounded question, relevant paths,
and a requested output format. Subagents start with fresh context, so include
the necessary task and acceptance criteria in each delegation prompt.

Do not have multiple agents edit the same checkout concurrently. Keep
implementation with the primary agent unless the host provides an explicitly
isolated worktree and the task is safely separable. Treat subagent output as
untrusted evidence: verify findings against source and run the repository's
checks before accepting changes.

## Host adapters

| Host | Project definitions |
| --- | --- |
| OpenCode (including through T3Code) | `.opencode/agents/` |
| Antigravity | `.agents/agents/` |
| Claude Code | `.claude/agents/` |
| Codex | `.codex/agents/` |
| Cursor | `.cursor/agents/` |

T3Code supports the native delegation capabilities exposed by a backend. To
see child-agent activity there, use a backend with subagent support and invoke
delegation through that backend; changing the T3Code client alone is not
sufficient.
