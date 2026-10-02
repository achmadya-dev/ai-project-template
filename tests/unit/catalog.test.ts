import { describe, expect, it } from 'vitest'
import { itemInput } from '../../src/modules/catalog/domain/item'
import { isDemoEnabled, requireDemo } from '../../src/server/demo-policy'
describe('catalog input contract', () => {
  it('normalizes SKU and trims name', () => {
    expect(itemInput.parse({ sku: ' ab-001 ', name: ' Bolt ' })).toEqual({ sku: 'AB-001', name: 'Bolt' })
  })
  it.each(['', ' ', '../x', 'SKU WITH SPACE', 'A'.repeat(33)])('rejects invalid SKU %j', sku => {
    expect(itemInput.safeParse({ sku, name: 'Bolt' }).success).toBe(false)
  })
  it('rejects blank names and unknown fields', () => {
    expect(itemInput.safeParse({ sku: 'A', name: '  ' }).success).toBe(false)
    expect(itemInput.safeParse({ sku: 'A', name: 'Bolt', admin: true }).success).toBe(false)
  })
})
describe('development demo boundary', () => {
  it('requires opt in', () => expect(isDemoEnabled({ NODE_ENV: 'development' })).toBe(false))
  it('refuses an unspecified environment even with opt in', () => expect(isDemoEnabled({ DEMO_ENABLED: 'true' })).toBe(false))
  it('allows explicit development demo', () => expect(isDemoEnabled({ NODE_ENV: 'development', DEMO_ENABLED: 'true' })).toBe(true))
  it('refuses production even when enabled', () => expect(() => requireDemo({ NODE_ENV: 'production', DEMO_ENABLED: 'true' })).toThrow())
})
