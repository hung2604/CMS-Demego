import { z } from 'zod'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const { email, password } = bodySchema.parse(body)

  const db = await useMongoDb()
  const doc = await db.collection('users').findOne({ email: email.toLowerCase() })

  if (!doc || typeof doc.passwordHash !== 'string') {
    throw createError({ statusCode: 401, statusMessage: 'invalidCredentials' })
  }

  const ok = await verifyPassword(doc.passwordHash, password)
  if (!ok) {
    throw createError({ statusCode: 401, statusMessage: 'invalidCredentials' })
  }

  await setUserSession(event, {
    user: {
      id: String(doc._id),
      email: doc.email as string,
      name: (doc.name as string | undefined) ?? null
    },
    loggedInAt: new Date()
  })

  return { ok: true }
})
