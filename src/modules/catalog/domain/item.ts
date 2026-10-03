import { z } from 'zod'

const skuPattern = /^[A-Z0-9][A-Z0-9_-]*$/

export const itemInput = z
  .object({
    sku: z
      .string()
      .trim()
      .toUpperCase()
      .min(1)
      .max(32)
      .regex(skuPattern, 'SKU hanya huruf, angka, - dan _'),
    name: z.string().trim().min(1, 'Nama wajib diisi').max(120),
  })
  .strict()

export const itemRow = z
  .object({
    id: z.string().uuid(),
    sku: z.string().min(1).max(32).regex(skuPattern),
    name: z.string().min(1).max(120),
  })
  .strict()

export type ItemInput = z.infer<typeof itemInput>
export type Item = z.infer<typeof itemRow>
