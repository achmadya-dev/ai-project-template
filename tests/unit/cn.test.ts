import { describe, expect, it } from 'vitest'
import { cn } from '../../src/lib/cn'

function stateClass(active: boolean) {
  return cn('rounded-md', active && 'font-bold', !active && 'italic')
}

describe('cn', () => {
  it('combines conditional classes', () => {
    expect(stateClass(true)).toBe('rounded-md font-bold')
    expect(stateClass(false)).toBe('rounded-md italic')
  })

  it('resolves conflicting Tailwind utilities in favor of the later class', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})
