# Markdown content

Use for a concrete publishing or user-content requirement. The template does not install a Markdown renderer or expose a Markdown endpoint.

Choose whether authors and content are trusted. Prefer disabling raw HTML; if HTML is required, sanitize the parsed output using a maintained allowlist and verify plugin order. Validate links and image URLs, including dangerous schemes, and assess external image tracking. Limit content size and expensive rendering; consider CSP and rendering on the appropriate side of the server/client boundary.

Add a renderer only after reviewing its dependency and maintenance costs. Test normal Markdown, malformed input, script and event-handler injection, dangerous links, images, and accessibility. Never claim sanitization makes arbitrary plugins or later transformations safe without testing their complete pipeline.
