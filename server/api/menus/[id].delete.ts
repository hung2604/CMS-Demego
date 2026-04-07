import { ObjectId } from 'mongodb'
import { requireAuthSession } from '../../utils/require-auth'

export default defineEventHandler(async (event) => {
  await requireAuthSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const db = await useMongoDb()

  // Also delete child menus
  await db.collection('menus').deleteMany({ parentId: id })

  const result = await db.collection('menus').deleteOne({ _id: new ObjectId(id) })

  if (result.deletedCount === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Menu not found' })
  }

  return { success: true }
})
