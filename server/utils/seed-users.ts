import type { Db } from 'mongodb'

/** User demo sau seed — đổi mật khẩu trên môi trường thật. */
export const SEED_USER_FIXTURES = [
  { email: 'admin@example.com', password: 'admin123', name: 'Admin' },
  { email: 'editor@example.com', password: 'editor123', name: 'Editor' },
  { email: 'viewer@example.com', password: 'viewer123', name: 'Viewer' }
] as const

export async function ensureUsersUniqueIndex (db: Db) {
  await db.collection('users').createIndex({ email: 1 }, { unique: true })
}

/**
 * Idempotent: user đã tồn tại thì không ghi đè mật khẩu.
 */
export async function upsertSeedUsers (db: Db) {
  await ensureUsersUniqueIndex(db)
  const now = new Date()
  let inserted = 0
  for (const u of SEED_USER_FIXTURES) {
    const email = u.email.toLowerCase()
    const passwordHash = await hashPassword(u.password)
    const result = await db.collection('users').updateOne(
      { email },
      {
        $setOnInsert: {
          email,
          passwordHash,
          name: u.name,
          createdAt: now,
          updatedAt: now
        }
      },
      { upsert: true }
    )
    if (result.upsertedCount) inserted += 1
  }
  return { inserted }
}
