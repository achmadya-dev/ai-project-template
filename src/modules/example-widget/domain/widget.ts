import { z } from 'zod'

export const widgetInput = z.object({ name: z.string().trim().min(1).max(80) }).strict()
export const widgetRow = z.object({ id: z.string().uuid(), name: z.string().min(1).max(80) })
export type WidgetInput = z.infer<typeof widgetInput>
