import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const db = await useMongoDb()
  const post = await db.collection('posts').findOne({ _id: new ObjectId(id) })

  if (!post) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }

  return post
})
