# Review procedure

Read the task, actual diff, `docs/CODE_STANDARDS.md`, affected domain/context, tests, and CI results independently. Use `docs/PATTERNS.md` to detect unnecessary new patterns, but treat `docs/CODE_STANDARDS.md` as the normative contract.

Review in this order:

1. **Contract**: does the implementation satisfy the accepted behavior without unrelated scope?
2. **Boundaries**: are domain, repository, server-function, route, and shared-server responsibilities separated correctly?
3. **Trust/security**: are untrusted inputs validated, authorization/policy checks before side effects, secrets protected, and server-only dependencies kept out of client code?
4. **Data integrity**: are SQL queries parameterized, concurrency-sensitive invariants enforced by the database, migrations safe/forward-only, and known database errors translated narrowly?
5. **Failure behavior**: are expected business failures explicit and unexpected failures preserved rather than swallowed?
6. **Tests**: do tests prove behavior at the cheapest correct layer, include meaningful negative cases, and avoid merely mirroring the implementation?
7. **Simplicity**: did the change avoid speculative dependencies, generic service/helper layers, and abstractions without a current concrete need?
8. **Compatibility/evidence**: are relevant lint/type/build/integration/E2E/production checks actually run and accurately reported?

For risky changes, also check concurrency, permission/tenant boundaries, migrations, auth, dependency changes, network exposure, CI/governance, and recovery where relevant.

Distinguish observed defects from hypotheses. Findings should include evidence, impact/severity, and file/location. If no blocking findings exist, state residual risks and unverified assumptions rather than giving a blanket quality guarantee.

The authoring agent must perform the self-review checklist in `docs/CODE_STANDARDS.md` before requesting review. Reviewers should treat undocumented exceptions from that contract as findings.

AI review reduces routine review burden but does not substitute for product/domain ownership, security review when warranted, or required human approval. Do not silently approve or merge your own changes.
