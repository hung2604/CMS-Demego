import { ObjectId } from 'mongodb'
import { requireAuthSession } from '../../utils/require-auth'

export default defineEventHandler(async (event) => {
  await requireAuthSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const db = await useMongoDb()
  const result = await db.collection('posts').deleteOne({ _id: new ObjectId(id) })

  if (result.deletedCount === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }

  return { success: true }
})
