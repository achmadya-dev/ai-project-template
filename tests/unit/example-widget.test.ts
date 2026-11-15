import { describe, expect, it } from 'vitest'
import { widgetInput } from '../../src/modules/example-widget/domain/widget'

describe('example widget input', () => {
  it('trims a valid name', () => {
    expect(widgetInput.parse({ name: ' Example ' })).toEqual({ name: 'Example' })
  })

  it('rejects empty, oversized, and unexpected input', () => {
    expect(widgetInput.safeParse({ name: ' ' }).success).toBe(false)
    expect(widgetInput.safeParse({ name: 'x'.repeat(81) }).success).toBe(false)
    expect(widgetInput.safeParse({ name: 'Example', extra: true }).success).toBe(false)
  })
})
