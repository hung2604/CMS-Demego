import { list } from '@vercel/blob'
import { getQuery } from 'h3'
import { getR2Config, r2ListObjects, r2PublicUrl } from '../../utils/r2'
import { requireAuthSession } from '../../utils/require-auth'

const MAX_LIMIT = 100

type StorageSource = 'r2' | 'vercel'

export default defineEventHandler(async (event) => {
  await requireAuthSession(event)
  const r2 = getR2Config()
  const { blobReadWriteToken } = useRuntimeConfig()

  /** Kho đang dùng được — R2 (file mới) và Vercel Blob (file cũ) nếu còn token */
  const sources: StorageSource[] = [
    ...(r2 ? ['r2' as const] : []),
    ...(blobReadWriteToken ? ['vercel' as const] : [])
  ]
  if (!sources.length) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Chưa cấu hình R2_* hoặc BLOB_READ_WRITE_TOKEN'
    })
  }

  const q = getQuery(event)
  const source: StorageSource = sources.includes(q.source as StorageSource)
    ? q.source as StorageSource
    : sources[0]!
  const prefixRaw = typeof q.prefix === 'string' ? q.prefix : 'cms/'
  const prefix = prefixRaw === '' ? undefined : prefixRaw
  const cursor = typeof q.cursor === 'string' && q.cursor.length ? q.cursor : undefined
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(q.limit) || 48)
  )

  if (source === 'r2') {
    const result = await r2ListObjects(r2!, { prefix, limit, cursor })
    return {
      source,
      sources,
      blobs: result.objects.map(o => ({
        url: r2PublicUrl(r2!, o.key),
        pathname: o.key,
        size: o.size,
        uploadedAt: o.lastModified
      })),
      cursor: result.cursor,
      hasMore: result.hasMore
    }
  }

  const result = await list({
    token: blobReadWriteToken,
    prefix,
    limit,
    cursor,
    mode: 'expanded'
  })

  return {
    source,
    sources,
    blobs: result.blobs.map(b => ({
      url: b.url,
      pathname: b.pathname,
      size: b.size,
      uploadedAt: b.uploadedAt.toISOString()
    })),
    cursor: result.cursor,
    hasMore: result.hasMore
  }
})
