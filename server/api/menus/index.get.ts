export default defineEventHandler(async (event) => {
  const db = await useMongoDb()
  const query = getQuery(event)

  if (query.countOnly) {
    const total = await db.collection('menus').countDocuments()
    return { total }
  }

  const menus = await db.collection('menus')
    // Chỉ các field site + admin đang dùng (bỏ createdAt/updatedAt khỏi payload SSR)
    .find({}, { projection: { title: 1, slug: 1, icon: 1, parentId: 1, order: 1, postId: 1 } })
    .sort({ order: 1 })
    .toArray()

  return menus
})
