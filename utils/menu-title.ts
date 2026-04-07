export type MenuLocale = 'vi' | 'en'

/** Tiêu đề hiển thị theo locale; hỗ trợ legacy `title` dạng chuỗi. */
export function resolveMenuTitle (item: Record<string, unknown>, locale: MenuLocale): string {
  const t = item.title
  if (t == null) return ''
  if (typeof t === 'string') {
    return t.trim()
  }
  if (typeof t === 'object' && t !== null && 'vi' in t) {
    const o = t as Record<string, string>
    const primary = (o[locale] ?? '').trim()
    if (primary) return primary
    return (o.vi ?? o.en ?? '').trim()
  }
  return ''
}

export function normalizeMenuTitleFields (raw: unknown): { vi: string; en: string } {
  if (raw == null) return { vi: '', en: '' }
  if (typeof raw === 'string') return { vi: raw, en: raw }
  if (typeof raw === 'object' && raw !== null && 'vi' in raw) {
    const o = raw as Record<string, string>
    return { vi: o.vi ?? '', en: o.en ?? '' }
  }
  return { vi: '', en: '' }
}

/** Nối cả hai tiêu đề để tìm kiếm / gợi ý admin. */
export function menuTitleSearchBlob (item: Record<string, unknown>): string {
  const { vi, en } = normalizeMenuTitleFields(item.title)
  const slug = String(item.slug ?? '').trim()
  return [vi, en, slug].filter(Boolean).join('\n')
}
