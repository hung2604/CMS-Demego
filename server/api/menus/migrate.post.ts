import { requireAuthSession } from '../../utils/require-auth'

/**
 * Migration một lần: title dạng chuỗi → { vi, en }.
 * Chạy an toàn nhiều lần — bản đã có title.vi được bỏ qua.
 */
export default defineEventHandler(async (event) => {
  await requireAuthSession(event)
  const db = await useMongoDb()

  const candidates = await db.collection('menus').find({
    'title.vi': { $exists: false }
  }).toArray()

  let migrated = 0
  for (const doc of candidates) {
    const t = doc.title
    const str = typeof t === 'string' ? t : ''
    await db.collection('menus').updateOne(
      { _id: doc._id },
      {
        $set: {
          title: { vi: str, en: str },
          updatedAt: new Date()
        }
      }
    )
    migrated++
  }

  return { migrated }
})
