import { escapeRegex } from '../../utils/escape-regex'
import { requireAuthSession } from '../../utils/require-auth'

export default defineEventHandler(async (event) => {
  await requireAuthSession(event)

  const query = getQuery(event)
  const searchRaw = typeof query.search === 'string' ? query.search.trim() : ''

  const db = await useMongoDb()
  const filter: Record<string, unknown> = {}
  if (searchRaw) {
    const rx = new RegExp(escapeRegex(searchRaw), 'i')
    filter.$or = [{ email: rx }, { name: rx }]
  }

  const docs = await db.collection('users')
    .find(filter, {
      projection: { passwordHash: 0 },
      sort: { createdAt: -1 }
    })
    .toArray()

  const users = docs.map(u => ({
    _id: u._id.toString(),
    email: u.email as string,
    name: (u.name as string | null | undefined) ?? null,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt
  }))

  return { users, total: users.length }
})
