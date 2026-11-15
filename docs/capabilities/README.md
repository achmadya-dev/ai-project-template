# Optional capability catalog

These guides give maintainers and agents a starting point, not a declaration that the feature is installed or production-ready. Start with the relevant product decision, follow `docs/CODE_STANDARDS.md`, and implement only the selected capability. Existing production behavior, credentials, integrations, and database schema do not change by reading these guides.

- [SEO](seo.md): optional tested metadata helper for public pages.
- [AI](ai.md): provider-independent integration checklist.
- [Markdown](markdown.md): safe content rendering checklist.
- [Content Security Policy](csp.md): deployment-specific response policy.
- [Health checks](health.md): liveness and readiness guidance.
- [Observability](observability.md): logging, metrics, and tracing guidance.
- [Vertical slice example](example-widget.md): inactive domain, server function, repository, and form.

The SEO helper and inactive vertical slice are code; the other guides are design guidance, not runnable integrations. Before adding dependencies or changing security, privacy, infrastructure, or CI, record decisions and conduct the risk review required by `AGENTS.md`.
