import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { requireAuthSession } from '../../utils/require-auth'

const menuTitleSchema = z.object({
  vi: z.string().default(''),
  en: z.string().default('')
}).refine(t => t.vi.trim().length > 0 || t.en.trim().length > 0, {
  message: 'At least one title (VI or EN) is required'
})

const menuUpdateSchema = z.object({
  title: menuTitleSchema.optional(),
  slug: z.string().min(1).optional(),
  icon: z.string().optional(),
  parentId: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
  postId: z.string().nullable().optional()
})

export default defineEventHandler(async (event) => {
  await requireAuthSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const body = await readBody(event)
  const data = menuUpdateSchema.parse(body)

  const db = await useMongoDb()

  const result = await db.collection('menus').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )

  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Menu not found' })
  }

  return result
})
