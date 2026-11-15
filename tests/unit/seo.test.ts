import { describe, expect, it } from 'vitest'
import { buildPageMetadata } from '../../src/lib/seo'

const input = {
  origin: 'https://example.com',
  path: '/articles?preview=1#heading',
  title: 'Articles',
  description: 'Published articles',
}

describe('optional page metadata', () => {
  it('builds metadata with a clean canonical URL', () => {
    const head = buildPageMetadata(input)
    expect(head.links).toEqual([{ rel: 'canonical', href: 'https://example.com/articles' }])
    expect(head.meta).toContainEqual({ property: 'og:title', content: 'Articles' })
    expect(head.meta).toContainEqual({ name: 'robots', content: 'index, follow' })
  })

  it('allows pages to opt out of indexing', () => {
    expect(buildPageMetadata({ ...input, noIndex: true }).meta).toContainEqual({
      name: 'robots',
      content: 'noindex, nofollow',
    })
  })

  it.each(['//other.example/path', '/\\other.example', 'relative'])(
    'rejects unsafe or relative path %s',
    (path) => {
      expect(() => buildPageMetadata({ ...input, path })).toThrow()
    },
  )

  it.each(['javascript:alert(1)', 'https://example.com/base', 'https://user@example.com'])(
    'rejects invalid origin %s',
    (origin) => {
      expect(() => buildPageMetadata({ ...input, origin })).toThrow()
    },
  )
})
