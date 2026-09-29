/**
 * Chuyển đoạn văn chỉ gồm một thẻ <a> trỏ tới YouTube hoặc Google Drive
 * thành iframe nhúng (xem công khai). HTML đầu vào đã được sanitize từ server.
 */

const WRAP_OPEN = '<div class="post-embed-video">'
const WRAP_CLOSE = '</div>'

export type VideoEmbedOptions = {
  /** Có nhãn → thêm nút "Phóng to" trên khung video (trang khách, xem useArticleMediaViewer) */
  expandLabel?: string
}

function escapeAttr (s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Icon material-symbols:open-in-full (SVG nội tuyến — nằm trong v-html nên không dùng được UIcon) */
function expandButton (label?: string): string {
  if (!label) return ''
  const l = escapeAttr(label)
  return `<button type="button" class="post-embed-expand" data-embed-expand aria-label="${l}" title="${l}"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 21v-8h2v4.6L17.6 5H13V3h8v8h-2V6.4L6.4 19H11v2z"/></svg></button>`
}

function decodeHref (raw: string): string {
  return raw
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

export function isEmbeddableVideoUrl (url: string): boolean {
  const u = url.trim()
  if (!u) return false
  return extractYoutubeId(u) != null || extractGdriveFileId(u) != null
}

function extractYoutubeId (url: string): string | null {
  try {
    const u = new URL(url.trim(), 'https://example.invalid')
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0] ?? ''
      return /^[\w-]{11}$/.test(id) ? id : null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (u.searchParams.get('v')) {
        const id = u.searchParams.get('v')!
        return /^[\w-]{11}$/.test(id) ? id : null
      }
      const em = u.pathname.match(/^\/embed\/([\w-]{11})/)
      if (em?.[1]) return em[1]
      const sh = u.pathname.match(/^\/shorts\/([\w-]{11})/)
      if (sh?.[1]) return sh[1]
    }
    return null
  } catch {
    return null
  }
}

function extractGdriveFileId (url: string): string | null {
  try {
    const u = new URL(url.trim(), 'https://example.invalid')
    const host = u.hostname.replace(/^www\./, '')
    if (host !== 'drive.google.com') return null
    const m = u.pathname.match(/\/file\/d\/([^/]+)/)
    if (!m?.[1] || m[1].length < 10) return null
    return m[1]
  } catch {
    return null
  }
}

function iframeYoutube (videoId: string, opts: VideoEmbedOptions): string {
  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`
  return `${WRAP_OPEN}${expandButton(opts.expandLabel)}<iframe src="${src}" class="post-embed-iframe" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>${WRAP_CLOSE}`
}

function iframeGdrive (fileId: string, opts: VideoEmbedOptions): string {
  const src = `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`
  return `${WRAP_OPEN}${expandButton(opts.expandLabel)}<iframe src="${src}" class="post-embed-iframe" title="Google Drive preview" allow="autoplay" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>${WRAP_CLOSE}`
}

function isOnlyAnchor (inner: string): boolean {
  const t = inner.trim()
  return /^<a\s[^>]*href="[^"]+"[^>]*>[\s\S]*<\/a>$/i.test(t)
}

/**
 * Thay các đoạn `<p>…</p>` chỉ chứa một link tới YouTube / Drive bằng iframe.
 */
export function expandStandaloneVideoEmbeds (html: string, opts: VideoEmbedOptions = {}): string {
  if (!html || !html.includes('<a ')) return html

  return html.replace(/<p([^>]*)>([\s\S]*?)<\/p>/gi, (full, _attrs: string, inner: string) => {
    if (!isOnlyAnchor(inner)) return full
    const hm = inner.trim().match(/^<a\s[^>]*href="([^"]+)"[^>]*>/i)
    if (!hm?.[1]) return full
    const href = decodeHref(hm[1])
    const yt = extractYoutubeId(href)
    if (yt) return iframeYoutube(yt, opts)
    const gd = extractGdriveFileId(href)
    if (gd) return iframeGdrive(gd, opts)
    return full
  })
}
