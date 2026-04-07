import { ObjectId } from 'mongodb'
import type { Db } from 'mongodb'

export function normalizePostNeighborId (v: unknown, selfId?: string): string | null {
  if (v == null || v === '') return null
  const s = String(v)
  if (!ObjectId.isValid(s)) return null
  if (selfId && s === selfId) return null
  return s
}

export type NeighborNav = { title: string; slug: string }

export async function postNeighborNav (
  db: Db,
  postIdRaw: unknown,
  lang: 'vi' | 'en'
): Promise<NeighborNav | null> {
  if (postIdRaw == null || postIdRaw === '') return null
  const idStr = String(postIdRaw)
  if (!ObjectId.isValid(idStr)) return null
  const doc = await db.collection('posts').findOne({
    _id: new ObjectId(idStr),
    status: 'published'
  })
  if (!doc) return null
  const title = doc.title?.[lang] ?? doc.title?.vi ?? ''
  const slug = doc.slug?.[lang] ?? doc.slug?.vi ?? ''
  if (!slug) return null
  return { title, slug }
}
