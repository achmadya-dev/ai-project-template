import { z } from 'zod'
export const itemInput = z.object({
  sku: z.string().trim().toUpperCase().min(1).max(32).regex(/^[A-Z0-9][A-Z0-9_-]*$/, 'SKU hanya huruf, angka, - dan _'),
  name: z.string().trim().min(1, 'Nama wajib diisi').max(120),
}).strict()
export type ItemInput = z.infer<typeof itemInput>
export type Item = { id: string; sku: string; name: string }
export type CreateItemResult = { ok: true; item: Item } | { ok: false; code: 'DUPLICATE_SKU' }
