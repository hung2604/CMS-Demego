import sanitizeHtmlLib from 'sanitize-html'

/** Tuỳ chọn tương đương DOMPurify trước đây; dùng sanitize-html (Node) để tránh jsdom/@exodus/bytes trên Vercel. */
const SANITIZE_OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr', 'figure', 'figcaption',
    'sub', 'sup', 'mark', 'span', 'div'
  ],
  allowedAttributes: {
    '*': [
      'class', 'style', 'id',
      'data-type', 'data-id', 'data-label', 'data-href', 'data-target',
      'data-color', 'data-level', 'data-align', 'data-rowspan', 'data-colspan'
    ],
    a: ['href', 'target', 'rel', 'title', 'class', 'style', 'id'],
    img: ['src', 'alt', 'title', 'width', 'height', 'class', 'style'],
    td: ['colspan', 'rowspan', 'class', 'style'],
    th: ['colspan', 'rowspan', 'class', 'style'],
    table: ['class', 'style'],
    figure: ['class', 'style'],
    figcaption: ['class', 'style']
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data', 'blob']
  },
  allowProtocolRelative: false
}

export function sanitizeHtml (html: string): string {
  return sanitizeHtmlLib(html, SANITIZE_OPTIONS)
}

export function sanitizePostContent<T extends { content?: { vi?: string; en?: string } }> (data: T): T {
  if (data.content) {
    if (data.content.vi) data.content.vi = sanitizeHtml(data.content.vi)
    if (data.content.en) data.content.en = sanitizeHtml(data.content.en)
  }
  return data
}
