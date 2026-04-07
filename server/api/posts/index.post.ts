import { z } from 'zod'
import { sanitizePostContent } from '../../utils/sanitize'
import { normalizePostNeighborId } from '../../utils/post-neighbors'
import { requireAuthSession } from '../../utils/require-auth'

const localeStringSchema = z.object({
  vi: z.string().default(''),
  en: z.string().default('')
})

const localeSeoSchema = z.object({
  vi: z.object({ title: z.string().default(''), description: z.string().default('') }).default({}),
  en: z.object({ title: z.string().default(''), description: z.string().default('') }).default({})
})

const postSchema = z.object({
  title: localeStringSchema,
  slug: z.object({
    vi: z.string().min(1, 'Slug VI is required'),
    en: z.string().min(1, 'Slug EN is required')
  }),
  content: localeStringSchema,
  excerpt: localeStringSchema,
  status: z.enum(['draft', 'published']).default('draft'),
  menuId: z.string().nullable().optional().default(null),
  prevPostId: z.string().nullable().optional().default(null),
  nextPostId: z.string().nullable().optional().default(null),
  seo: localeSeoSchema
})

export default defineEventHandler(async (event) => {
  await requireAuthSession(event)
  const body = await readBody(event)
  const parsed = postSchema.parse(body)
  const data = sanitizePostContent(parsed)

  const prevPostId = normalizePostNeighborId(parsed.prevPostId)
  const nextPostId = normalizePostNeighborId(parsed.nextPostId)

  const db = await useMongoDb()
  const now = new Date()

  const [existingVi, existingEn] = await Promise.all([
    db.collection('posts').findOne({ 'slug.vi': data.slug.vi }),
    db.collection('posts').findOne({ 'slug.en': data.slug.en })
  ])
  if (existingVi) throw createError({ statusCode: 409, statusMessage: 'Vietnamese slug already exists' })
  if (existingEn) throw createError({ statusCode: 409, statusMessage: 'English slug already exists' })

  const result = await db.collection('posts').insertOne({
    ...data,
    prevPostId,
    nextPostId,
    createdAt: now,
    updatedAt: now
  })

  return { _id: result.insertedId, ...data, prevPostId, nextPostId, createdAt: now, updatedAt: now }
})
