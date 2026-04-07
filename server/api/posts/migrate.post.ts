import { requireAuthSession } from '../../utils/require-auth'

/**
 * One-time migration: convert old flat-schema posts (title: string, slug: string, …)
 * to the bilingual schema (title: { vi, en }, slug: { vi, en }, …).
 * Safe to run multiple times — documents already migrated are skipped.
 */
export default defineEventHandler(async (event) => {
  await requireAuthSession(event)
  const db = await useMongoDb()

  const oldPosts = await db.collection('posts').find({
    'slug.vi': { $exists: false }
  }).toArray()

  let migrated = 0
  for (const post of oldPosts) {
    await db.collection('posts').updateOne(
      { _id: post._id },
      {
        $set: {
          title: { vi: post.title ?? '', en: '' },
          slug: { vi: post.slug ?? '', en: '' },
          content: { vi: post.content ?? '', en: '' },
          excerpt: { vi: post.excerpt ?? '', en: '' },
          seo: {
            vi: { title: post.seo?.title ?? '', description: post.seo?.description ?? '' },
            en: { title: '', description: '' }
          }
        },
        $unset: { locale: '' }
      }
    )
    migrated++
  }

  return { migrated, skipped: oldPosts.length - migrated }
})
