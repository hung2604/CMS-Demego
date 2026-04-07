export default defineEventHandler(async (event) => {
  const db = await useMongoDb()
  const query = getQuery(event)

  if (query.countOnly) {
    const total = await db.collection('posts').countDocuments()
    return { total }
  }

  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10))
  const skip = (page - 1) * limit

  const filter: Record<string, any> = {}

  if (query.status) {
    filter.status = query.status
  }

  if (query.search) {
    filter.$or = [
      { 'title.vi': { $regex: query.search, $options: 'i' } },
      { 'title.en': { $regex: query.search, $options: 'i' } },
      { 'slug.vi': { $regex: query.search, $options: 'i' } },
      { 'slug.en': { $regex: query.search, $options: 'i' } }
    ]
  }

  const [posts, total] = await Promise.all([
    db.collection('posts').find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    db.collection('posts').countDocuments(filter)
  ])

  return { posts, total, page, limit }
})
