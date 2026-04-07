import { z } from 'zod'
import { requireAuthSession } from '../../utils/require-auth'

const settingsSchema = z.object({
  siteName: z.string().optional(),
  siteDescription: z.string().optional(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  footerText: z.string().optional(),
  socialLinks: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    github: z.string().optional(),
    youtube: z.string().optional()
  }).optional()
})

export default defineEventHandler(async (event) => {
  await requireAuthSession(event)
  const body = await readBody(event)
  const data = settingsSchema.parse(body)

  const db = await useMongoDb()

  await db.collection('settings').updateOne(
    { _id: 'site' as any },
    {
      $set: { ...data, updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  )

  return await db.collection('settings').findOne({ _id: 'site' as any })
})
