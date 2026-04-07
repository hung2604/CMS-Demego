import { z } from 'zod'
import { ensureUsersUniqueIndex } from '../../utils/seed-users'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().max(120).optional().default('')
})

export default defineEventHandler(async (event) => {
  const { adminAllowRegister } = useRuntimeConfig()
  if (!adminAllowRegister) {
    throw createError({ statusCode: 403, statusMessage: 'registerDisabled' })
  }

  const body = await readBody(event).catch(() => ({}))
  const parsed = bodySchema.parse(body)
  const email = parsed.email.toLowerCase()

  const db = await useMongoDb()
  await ensureUsersUniqueIndex(db)

  const passwordHash = await hashPassword(parsed.password)
  const now = new Date()
  const name = parsed.name?.trim() || null

  try {
    const result = await db.collection('users').insertOne({
      email,
      passwordHash,
      name,
      createdAt: now,
      updatedAt: now
    })

    await setUserSession(event, {
      user: {
        id: result.insertedId.toString(),
        email,
        name
      },
      loggedInAt: new Date()
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
