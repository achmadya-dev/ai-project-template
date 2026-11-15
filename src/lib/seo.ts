export interface PageMetadata {
  origin: string
  path: string
  title: string
  description: string
  noIndex?: boolean
}

/** Build public-page metadata from a configured origin and an internal path. */
export function buildPageMetadata({ origin, path, title, description, noIndex }: PageMetadata) {
  const base = new URL(origin)
  if (
    !['http:', 'https:'].includes(base.protocol) ||
    base.username ||
    base.password ||
    base.pathname !== '/' ||
    base.search ||
    base.hash
  ) {
    throw new Error(
      'Origin must be an HTTP(S) origin without credentials, path, query, or fragment',
    )
  }
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    throw new Error('Path must be an absolute internal path')
  }
  const canonical = new URL(path, base)
  if (canonical.origin !== base.origin) throw new Error('Path must remain on the configured origin')
  canonical.search = ''
  canonical.hash = ''

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { name: 'robots', content: noIndex ? 'noindex, nofollow' : 'index, follow' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonical.href },
    ],
    links: [{ rel: 'canonical', href: canonical.href }],
  }
}
