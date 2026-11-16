# Architecture decision records

ADRs explain **why a durable design choice was made**, the alternatives rejected, and the consequences. Current operational instructions live in `docs/ARCHITECTURE.md`, `docs/CODE_STANDARDS.md`, and runbooks; ADRs are not substitutes for those documents.

- [ADR 0001 — SQLite default and portable SQL](0001-portable-databases.md): accepted for provider choice and provider-specific migrations; its temporary PostgreSQL-only application adapter compatibility choice was superseded by ADR 0002.
- [ADR 0002 — Kysely as the application persistence adapter](0002-kysely-as-the-application-persistence-adapter.md): accepted current application persistence seam.

Use [`0000-template.md`](0000-template.md) only for a decision that crosses modules, changes a durable contract, or is expensive to reverse. Use the next number, date the decision, link a real issue/task if one exists, and record context, decision, alternatives, consequences, and how to evaluate it. Keep accepted and superseded ADRs in Git to preserve reasoning. When replacing only part of a decision, say exactly which part and link both records; update current architecture/runbook guidance as needed. Routine task status, command logs, and PR evidence belong in issues/PRs or a temporary local task, not in ADRs.
