import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr', 'figure', 'figcaption',
      'sub', 'sup', 'mark', 'span', 'div'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'style',
      'rel', 'target', 'width', 'height',
      'colspan', 'rowspan', 'data-*'
    ],
    ALLOW_DATA_ATTR: true,
    FORCE_BODY: false
  })
}

export function sanitizePostContent<T extends { content?: { vi?: string; en?: string } }>(data: T): T {
  if (data.content) {
    if (data.content.vi) data.content.vi = sanitizeHtml(data.content.vi)
    if (data.content.en) data.content.en = sanitizeHtml(data.content.en)
  }
  return data
}
