# Content Security Policy

CSP must be designed for the actual application and host; this template does not set a CSP. Preserve TanStack Start's server-function CSRF protection independently of CSP.

Inventory scripts, styles, images, fonts, API origins, framework-generated inline content, and third-party integrations. Select a nonce or hash strategy supported by the pinned runtime and hosting cache model; do not assume a static policy works for every deployment. Roll out with `Content-Security-Policy-Report-Only` when appropriate, inspect sanitized reports, and then enforce an explicitly reviewed policy. Avoid placing secrets or sensitive URLs in reports.

Verify response headers and actual browser behavior on every relevant route, including hydration and error pages. Add negative tests proving disallowed sources are blocked. CSP is defense in depth, not a substitute for output encoding, authorization, or input validation. Do not enable permissive directives merely to silence violations.
