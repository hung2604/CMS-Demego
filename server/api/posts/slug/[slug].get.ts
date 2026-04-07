import { postNeighborNav } from '../../../utils/post-neighbors'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

  const query = getQuery(event)
  const locale = (query.locale as string) || 'vi'

  const db = await useMongoDb()

  // Find document matching either locale's slug
  const post = await db.collection('posts').findOne({
    $or: [{ 'slug.vi': slug }, { 'slug.en': slug }]
  })

  if (!post) throw createError({ statusCode: 404, statusMessage: 'Post not found' })

  const lang = (locale === 'en' && post.slug?.en) ? 'en' : 'vi'

  const [prev, next] = await Promise.all([
    postNeighborNav(db, post.prevPostId, lang),
    postNeighborNav(db, post.nextPostId, lang)
  ])

  return {
    _id: post._id,
    title: post.title?.[lang] ?? post.title?.vi ?? '',
    slug: post.slug?.[lang] ?? post.slug?.vi ?? '',
    content: post.content?.[lang] ?? post.content?.vi ?? '',
    excerpt: post.excerpt?.[lang] ?? post.excerpt?.vi ?? '',
    seo: post.seo?.[lang] ?? post.seo?.vi ?? { title: '', description: '' },
    status: post.status,
    menuId: post.menuId ?? null,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    prev,
    next,
    alternateSlugs: {
      vi: post.slug?.vi ?? '',
      en: post.slug?.en ?? ''
    }
  }
})
