# Implementation procedure

1. Read the accepted task, `AGENTS.md`, `docs/CODE_STANDARDS.md`, affected product/domain context, and the closest existing implementation. Use `docs/PATTERNS.md` before inventing a new pattern.
2. Check repository status, preserve unrelated edits, and create/use the task branch.
3. Implement the smallest coherent vertical slice that satisfies the acceptance criteria. Keep domain, persistence, transport, and UI responsibilities inside their documented boundaries.
4. Validate untrusted input at the server boundary, enforce policy before side effects, and represent expected business failures explicitly.
5. Add tests at the cheapest layer that proves the behavior, including meaningful failure/boundary cases. Do not weaken existing checks to obtain green CI.
6. Run the relevant verification commands. At minimum for code changes run `bun run check`; add integration, E2E, and production smoke when the affected behavior requires them.
7. Review the complete diff against the required self-review checklist in `docs/CODE_STANDARDS.md`. Fix violations before reporting completion; record any intentional exception with its reason.
8. Record actual outcomes, update docs/ADR/runbook and handoff where the contract changed, and create/update the PR with true issue links and evidence when access exists.

For incomplete external access, leave the local evidence and name the blocked external step. Never report unrun checks, unpublished issues, or unverified behavior as complete. Do not merge or deploy without authorization.
