import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { sanitizePostContent } from '../../utils/sanitize'
import { normalizePostNeighborId } from '../../utils/post-neighbors'
import { requireAuthSession } from '../../utils/require-auth'

const localeStringSchema = z.object({
  vi: z.string().optional(),
  en: z.string().optional()
})

const localeSeoSchema = z.object({
  vi: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
  en: z.object({ title: z.string().optional(), description: z.string().optional() }).optional()
})

const postUpdateSchema = z.object({
  title: localeStringSchema.optional(),
  slug: z.object({ vi: z.string().min(1).optional(), en: z.string().min(1).optional() }).optional(),
  content: localeStringSchema.optional(),
  excerpt: localeStringSchema.optional(),
  status: z.enum(['draft', 'published']).optional(),
  menuId: z.string().nullable().optional(),
  prevPostId: z.string().nullable().optional(),
  nextPostId: z.string().nullable().optional(),
  seo: localeSeoSchema.optional()
})

export default defineEventHandler(async (event) => {
  await requireAuthSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const body = await readBody(event)
  const parsed = postUpdateSchema.parse(body)
  const data = sanitizePostContent(parsed)
  if ('prevPostId' in parsed) {
    (data as Record<string, unknown>).prevPostId = normalizePostNeighborId(parsed.prevPostId, id)
  }
  if ('nextPostId' in parsed) {
    (data as Record<string, unknown>).nextPostId = normalizePostNeighborId(parsed.nextPostId, id)
  }

  const db = await useMongoDb()
  const oid = new ObjectId(id)

  if (data.slug?.vi) {
    const existing = await db.collection('posts').findOne({ 'slug.vi': data.slug.vi, _id: { $ne: oid } })
    if (existing) throw createError({ statusCode: 409, statusMessage: 'Vietnamese slug already exists' })
  }
  if (data.slug?.en) {
    const existing = await db.collection('posts').findOne({ 'slug.en': data.slug.en, _id: { $ne: oid } })
    if (existing) throw createError({ statusCode: 409, statusMessage: 'English slug already exists' })
  }

  const result = await db.collection('posts').findOneAndUpdate(
    { _id: oid },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )

  if (!result) throw createError({ statusCode: 404, statusMessage: 'Post not found' })

  return result
})
