export default defineEventHandler(async (event) => {
  const db = await useMongoDb()
  const query = getQuery(event)

  if (query.countOnly) {
    const total = await db.collection('menus').countDocuments()
    return { total }
  }

  const menus = await db.collection('menus')
    .find()
    .sort({ order: 1 })
    .toArray()

  return menus
})
