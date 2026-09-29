import { AwsClient } from 'aws4fetch'

/**
 * Cloudflare R2 qua S3 API. File mới upload lên R2; file cũ vẫn nằm trên Vercel Blob
 * (URL tuyệt đối trong nội dung bài không đổi nên vẫn hiển thị bình thường).
 */
export type R2Config = {
  endpoint: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  publicUrl: string
}

export type R2Object = {
  key: string
  size: number
  lastModified: string
}

/** Đủ 5 biến R2_* → dùng R2; thiếu bất kỳ biến nào → null (upload quay về Vercel Blob). */
export function getR2Config (): R2Config | null {
  const { r2 } = useRuntimeConfig()
  const cfg: R2Config = {
    endpoint: String(r2?.endpoint ?? '').trim().replace(/\/+$/, ''),
    bucket: String(r2?.bucket ?? '').trim(),
    accessKeyId: String(r2?.accessKeyId ?? '').trim(),
    secretAccessKey: String(r2?.secretAccessKey ?? '').trim(),
    publicUrl: String(r2?.publicUrl ?? '').trim().replace(/\/+$/, '')
  }
  return Object.values(cfg).every(v => v.length > 0) ? cfg : null
}

function r2Client (cfg: R2Config): AwsClient {
  return new AwsClient({
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
    service: 's3',
    region: 'auto'
  })
}

function encodeKey (key: string): string {
  return key.split('/').map(encodeURIComponent).join('/')
}

export function r2PublicUrl (cfg: R2Config, key: string): string {
  return `${cfg.publicUrl}/${encodeKey(key)}`
}

/** Upload một object, trả về URL công khai (qua domain public_url của bucket). */
export async function r2PutObject (
  cfg: R2Config,
  key: string,
  body: Uint8Array,
  contentType: string
): Promise<string> {
  const res = await r2Client(cfg).fetch(`${cfg.endpoint}/${cfg.bucket}/${encodeKey(key)}`, {
    method: 'PUT',
    // Buffer từ multipart là Uint8Array<ArrayBufferLike>; lib DOM chỉ nhận bản ArrayBuffer
    body: body as Uint8Array<ArrayBuffer>,
    headers: {
      'Content-Type': contentType,
      // Tên file có timestamp nên không bao giờ ghi đè — cache lâu dài được
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
  if (!res.ok) {
    throw createError({ statusCode: 502, statusMessage: `Upload R2 thất bại (${res.status})` })
  }
  return r2PublicUrl(cfg, key)
}

function decodeXml (s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, '\'')
    .replace(/&amp;/g, '&')
}

function xmlTag (xml: string, tag: string): string | undefined {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))
  return m?.[1] != null ? decodeXml(m[1]) : undefined
}

/** ListObjectsV2 — phân trang bằng continuation token. */
export async function r2ListObjects (
  cfg: R2Config,
  opts: { prefix?: string, limit: number, cursor?: string }
): Promise<{ objects: R2Object[], cursor?: string, hasMore: boolean }> {
  const url = new URL(`${cfg.endpoint}/${cfg.bucket}`)
  url.searchParams.set('list-type', '2')
  url.searchParams.set('max-keys', String(opts.limit))
  if (opts.prefix) url.searchParams.set('prefix', opts.prefix)
  if (opts.cursor) url.searchParams.set('continuation-token', opts.cursor)

  const res = await r2Client(cfg).fetch(url.toString())
  if (!res.ok) {
    throw createError({ statusCode: 502, statusMessage: `Đọc danh sách R2 thất bại (${res.status})` })
  }
  const xml = await res.text()

  const objects = [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)].map(([, block]) => ({
    key: xmlTag(block!, 'Key') ?? '',
    size: Number(xmlTag(block!, 'Size') ?? 0),
    lastModified: xmlTag(block!, 'LastModified') ?? ''
  }))
  const hasMore = xmlTag(xml, 'IsTruncated') === 'true'

  return {
    objects,
    cursor: hasMore ? xmlTag(xml, 'NextContinuationToken') : undefined,
    hasMore
  }
}
