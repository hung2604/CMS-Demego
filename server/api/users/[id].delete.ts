import { ObjectId } from 'mongodb'
import { requireAuthSession } from '../../utils/require-auth'

export default defineEventHandler(async (event) => {
  await requireAuthSession(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const session = await getUserSession(event)
  if (session.user?.id === id) {
    throw createError({ statusCode: 403, statusMessage: 'cannotDeleteSelf' })
  }

  let oid: ObjectId
  try {
    oid = new ObjectId(id)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }

  const db = await useMongoDb()
  const result = await db.collection('users').deleteOne({ _id: oid })

  if (result.deletedCount === 0) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  return { ok: true }
})
