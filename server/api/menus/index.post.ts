import { z } from 'zod'
import { requireAuthSession } from '../../utils/require-auth'

const menuTitleSchema = z.object({
  vi: z.string().default(''),
  en: z.string().default('')
}).refine(t => t.vi.trim().length > 0 || t.en.trim().length > 0, {
  message: 'At least one title (VI or EN) is required'
})

const menuSchema = z.object({
  title: menuTitleSchema,
  slug: z.string().min(1),
  icon: z.string().optional().default(''),
  parentId: z.string().nullable().optional().default(null),
  order: z.number().int().min(0).optional().default(0),
  postId: z.string().nullable().optional().default(null)
})

export default defineEventHandler(async (event) => {
  await requireAuthSession(event)
  const body = await readBody(event)
  const data = menuSchema.parse(body)

  const db = await useMongoDb()
  const now = new Date()

  const result = await db.collection('menus').insertOne({
    ...data,
    createdAt: now,
    updatedAt: now
  })

  return {
    _id: result.insertedId,
    ...data,
    createdAt: now,
    updatedAt: now
  }
})
