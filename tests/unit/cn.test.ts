import { describe, expect, it } from 'vitest'
import { cn } from '../../src/lib/cn'

function stateClass(active: boolean) {
  return cn('block', active && 'font-bold', !active && 'hidden')
}

describe('cn', () => {
  it('combines conditional classes', () => {
    expect(stateClass(true)).toBe('block font-bold')
    expect(stateClass(false)).toBe('block hidden')
  })

  it('resolves conflicting Tailwind utilities in favor of the later class', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})
