# SEO for public pages

Use this capability when a page should be discoverable and shared. Private applications and authenticated pages may not need indexing.

`src/lib/seo.ts` exports the optional `buildPageMetadata` helper for a TanStack route's `head`. Supply an explicit public HTTP(S) origin, an internal absolute path, title, and description. The helper removes query and fragment from the canonical URL and accepts `noIndex` for pages that should not be indexed. It is not connected to any route by default.

Choose the canonical origin from trusted project configuration, not an untrusted request Host header. Decide which routes are public, how locales and query parameters affect canonical URLs, and whether robots.txt, sitemaps, Open Graph images, or structured data are needed. `noindex` is not access control. Escape serialized JSON-LD before inserting it into HTML; validate any user-supplied values.

Run `bun run test` for the helper tests. When adopting it, add browser or server-rendered HTML checks for each route's actual head and its indexing policy.
