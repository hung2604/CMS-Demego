import { z } from 'zod'
import { ensureUsersUniqueIndex } from '../../utils/seed-users'
import { requireAuthSession } from '../../utils/require-auth'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().max(120).optional().default('')
})

export default defineEventHandler(async (event) => {
  await requireAuthSession(event)

  const raw = await readBody(event).catch(() => ({}))
  const parsed = bodySchema.parse(raw)
  const email = parsed.email.toLowerCase()
  const name = parsed.name?.trim() || null

  const db = await useMongoDb()
  await ensureUsersUniqueIndex(db)

  const passwordHash = await hashPassword(parsed.password)
  const now = new Date()

  try {
    await db.collection('users').insertOne({
      email,
      passwordHash,
      name,
      createdAt: now,
      updatedAt: now
    })
  } catch (e: unknown) {
    const code = e && typeof e === 'object' && 'code' in e ? (e as { code: number }).code : 0
    if (code === 11000) {
      throw createError({ statusCode: 409, statusMessage: 'emailTaken' })
    }
    throw e
  }

  return { ok: true }
})
