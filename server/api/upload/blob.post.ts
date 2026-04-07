import { put } from '@vercel/blob'
import { readMultipartFormData } from 'h3'
import { requireAuthSession } from '../../utils/require-auth'

const MAX_BYTES = 4 * 1024 * 1024

const LOGO_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml'
])

const FAVICON_MIMES = new Set([
  ...LOGO_MIMES,
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/ico',
  'image/svg+xml'
])

function safeSegment (name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
  return (base || 'file').slice(0, 120)
}

export default defineEventHandler(async (event) => {
  await requireAuthSession(event)
  const { blobReadWriteToken } = useRuntimeConfig()
  if (!blobReadWriteToken) {
    throw createError({
      statusCode: 503,
      statusMessage: 'BLOB_READ_WRITE_TOKEN chưa cấu hình'
    })
  }

  const parts = await readMultipartFormData(event)
  if (!parts?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu multipart' })
  }

  const filePart = parts.find(p => p.name === 'file')
  const kindPart = parts.find(p => p.name === 'kind')
  const kindRaw = kindPart?.data?.toString() ?? 'logo'
  const kind = kindRaw === 'favicon' ? 'favicon' : kindRaw === 'post' ? 'post' : 'logo'

  if (!filePart?.data?.length || !filePart.filename) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu file' })
  }

  if (filePart.data.length > MAX_BYTES) {
    throw createError({ statusCode: 400, statusMessage: 'File quá lớn (tối đa 4MB)' })
  }

  let mime = filePart.type || 'application/octet-stream'
  const lower = filePart.filename.toLowerCase()
  if (!filePart.type || mime === 'application/octet-stream') {
    if (lower.endsWith('.ico')) mime = 'image/x-icon'
    else if (lower.endsWith('.svg')) mime = 'image/svg+xml'
    else if (lower.endsWith('.png')) mime = 'image/png'
    else if (lower.endsWith('.webp')) mime = 'image/webp'
    else if (lower.endsWith('.gif')) mime = 'image/gif'
    else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) mime = 'image/jpeg'
  }

  const allowed = kind === 'favicon' ? FAVICON_MIMES : LOGO_MIMES
  if (!allowed.has(mime)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Định dạng không hỗ trợ: ${mime}`
    })
  }

  const prefix = kind === 'favicon'
    ? 'cms/settings/favicon'
    : kind === 'post'
      ? 'cms/posts'
      : 'cms/settings/logo'
  const pathname = `${prefix}/${Date.now()}-${safeSegment(filePart.filename)}`

  const blob = await put(pathname, filePart.data, {
    access: 'public',
    token: blobReadWriteToken,
    contentType: mime
  })

  return { url: blob.url }
})
