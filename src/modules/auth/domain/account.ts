import { z } from 'zod'

export const createAccountInput = z
  .object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(255).toLowerCase(),
    username: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_.]+$/)
      .toLowerCase(),
    password: z.string().min(12).max(128),
  })
  .strict()
