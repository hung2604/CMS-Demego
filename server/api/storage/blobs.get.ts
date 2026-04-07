import { list } from '@vercel/blob'
import { getQuery } from 'h3'
import { requireAuthSession } from '../../utils/require-auth'

const MAX_LIMIT = 100

export default defineEventHandler(async (event) => {
  await requireAuthSession(event)
  const { blobReadWriteToken } = useRuntimeConfig()
  if (!blobReadWriteToken) {
    throw createError({
      statusCode: 503,
      statusMessage: 'BLOB_READ_WRITE_TOKEN chưa cấu hình'
    })
  }

  const q = getQuery(event)
  const prefixRaw = typeof q.prefix === 'string' ? q.prefix : 'cms/'
  const prefix = prefixRaw === '' ? undefined : prefixRaw
  const cursor = typeof q.cursor === 'string' && q.cursor.length ? q.cursor : undefined
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(q.limit) || 48)
  )

  const result = await list({
    token: blobReadWriteToken,
    prefix,
    limit,
    cursor,
    mode: 'expanded'
  })

  return {
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
