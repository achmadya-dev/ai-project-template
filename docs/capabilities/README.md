# Optional capability catalog

These guides give maintainers and agents a starting point, not a declaration that the feature is installed or production-ready. Start with the relevant product decision, follow `docs/CODE_STANDARDS.md`, and implement only the selected capability. Existing production behavior, credentials, integrations, and database schema do not change by reading these guides.

| Capability | What is provided | Enabled by default? |
| --- | --- | --- |
| [SEO](seo.md) | Tested metadata helper for public pages | No route integration |
| [AI](ai.md) | Provider-independent integration checklist | No |
| [Markdown](markdown.md) | Safe content rendering checklist | No |
| [Content Security Policy](csp.md) | Deployment-specific response policy guidance | No |
| [Health checks](health.md) | Liveness and readiness guidance | No |
| [Observability](observability.md) | Logging, metrics, and tracing guidance | No vendor integration |
| [Vertical slice example](example-widget.md) | Example domain, server function, repository, and form | Not mounted in the starter |

The SEO helper and inactive vertical slice are code; the other guides are design guidance, not runnable integrations. Before adding dependencies or changing security, privacy, infrastructure, or CI, record decisions and conduct the risk review required by `AGENTS.md`.
