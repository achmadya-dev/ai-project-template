import { describe, expect, it } from 'vitest'
import { cn } from '../../src/lib/cn'

describe('cn', () => {
  it('combines conditional classes', () => {
    expect(cn('block', false && 'hidden', { 'font-bold': true, italic: false })).toBe(
      'block font-bold',
    )
  })

  it('resolves conflicting Tailwind utilities in favor of the later class', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})
