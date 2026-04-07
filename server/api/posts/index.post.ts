import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { sanitizePostContent } from '../../utils/sanitize'
import { normalizePostNeighborId } from '../../utils/post-neighbors'
import { createChildMenuForPost } from '../../utils/post-menu-branch'
import { syncMenusForPost } from '../../utils/sync-post-menu'
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
  /** Mục menu cha: tạo mục con mới trỏ tới bài (không thay thế bài của mục cha). */
  parentMenuId: z.string().nullable().optional().default(null),
  prevPostId: z.string().nullable().optional().default(null),
  nextPostId: z.string().nullable().optional().default(null),
  seo: localeSeoSchema
})

export default defineEventHandler(async (event) => {
  await requireAuthSession(event)
  const body = await readBody(event)
  const parsed = postSchema.parse(body)
  const { parentMenuId, ...postFields } = parsed
  const data = sanitizePostContent(postFields)

  const prevPostId = normalizePostNeighborId(parsed.prevPostId)
  const nextPostId = normalizePostNeighborId(parsed.nextPostId)

  const db = await useMongoDb()
  const now = new Date()

  if (parentMenuId) {
    if (!ObjectId.isValid(parentMenuId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid parent menu id' })
    }
    const parent = await db.collection('menus').findOne({ _id: new ObjectId(parentMenuId) })
    if (!parent) throw createError({ statusCode: 400, statusMessage: 'Parent menu not found' })
  }

  const [existingVi, existingEn] = await Promise.all([
    db.collection('posts').findOne({ 'slug.vi': data.slug.vi }),
    db.collection('posts').findOne({ 'slug.en': data.slug.en })
  ])
  if (existingVi) throw createError({ statusCode: 409, statusMessage: 'Vietnamese slug already exists' })
  if (existingEn) throw createError({ statusCode: 409, statusMessage: 'English slug already exists' })

  const result = await db.collection('posts').insertOne({
    ...data,
    menuId: null,
    prevPostId,
    nextPostId,
    createdAt: now,
    updatedAt: now
  })

  const newId = result.insertedId.toString()

  if (parentMenuId) {
    await createChildMenuForPost(db, {
      postId: newId,
      parentMenuId,
      title: data.title,
      slug: data.slug.vi
    })
  }

  await syncMenusForPost(db, newId)

  const saved = await db.collection('posts').findOne({ _id: result.insertedId })
  return saved ?? { _id: result.insertedId, ...data, menuId: null, prevPostId, nextPostId, createdAt: now, updatedAt: now }
})
