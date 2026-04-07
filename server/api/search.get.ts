import { escapeRegex } from '../utils/escape-regex'
import { menuTitleSearchBlob, resolveMenuTitle } from '../../utils/menu-title'

type Locale = 'vi' | 'en'

function locString (val: unknown, loc: Locale): string {
  if (val == null) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object' && val !== null && 'vi' in val) {
    const o = val as Record<string, string>
    return o[loc] ?? o.vi ?? ''
  }
  return ''
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const raw = String(q.q ?? '').trim()
  const locale = (q.locale === 'en' ? 'en' : 'vi') as Locale

  if (raw.length === 0) {
    return { menus: [] as { id: string; label: string; to: string }[], posts: [] as { id: string; label: string; description?: string; to: string }[] }
  }

  const qLimited = raw.slice(0, 120)
  const rx = escapeRegex(qLimited)
  const rxSafe = new RegExp(rx, 'i')

  const db = await useMongoDb()

  const [menusRaw, postsRaw] = await Promise.all([
    db.collection('menus').find({}).sort({ order: 1 }).toArray(),
    db
      .collection('posts')
      .find({
        status: 'published',
        $or: [
          { 'title.vi': { $regex: rx, $options: 'i' } },
          { 'title.en': { $regex: rx, $options: 'i' } },
          { 'slug.vi': { $regex: rx, $options: 'i' } },
          { 'slug.en': { $regex: rx, $options: 'i' } },
          { 'excerpt.vi': { $regex: rx, $options: 'i' } },
          { 'excerpt.en': { $regex: rx, $options: 'i' } },
          { 'content.vi': { $regex: rx, $options: 'i' } },
          { 'content.en': { $regex: rx, $options: 'i' } }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(40)
      .project({
        title: 1,
        slug: 1,
        excerpt: 1
      })
      .toArray()
  ])

  const byId = new Map<string, (typeof menusRaw)[0]>()
  for (const m of menusRaw) {
    byId.set(String(m._id), m)
  }

  function menuBreadcrumb (menu: (typeof menusRaw)[0]): string {
    const parts: string[] = []
    let cur: typeof menu | undefined = menu
    const seen = new Set<string>()
    while (cur && !seen.has(String(cur._id))) {
      seen.add(String(cur._id))
      const row = cur as unknown as Record<string, unknown>
      parts.unshift(resolveMenuTitle(row, locale))
      const pidKey: string =
        cur.parentId != null && cur.parentId !== ''
          ? String(cur.parentId)
          : ''
      const next: (typeof menusRaw)[0] | undefined = pidKey ? byId.get(pidKey) : undefined
      cur = next
    }
    return parts.filter(Boolean).join(' › ')
  }

  const menus: { id: string; label: string; to: string }[] = []
  for (const m of menusRaw) {
    const slug = String(m.slug ?? '').trim()
    if (!slug) continue
    const blob = menuTitleSearchBlob(m as unknown as Record<string, unknown>)
    if (!rxSafe.test(blob) && !rxSafe.test(slug)) continue
    menus.push({
      id: `m-${String(m._id)}`,
      label: menuBreadcrumb(m),
      to: `/${slug}`
    })
  }

  const posts: { id: string; label: string; description?: string; to: string }[] = []
  for (const p of postsRaw) {
    const label = locString(p.title, locale)
    const slugVal = locString(p.slug, locale)
    if (!label || !slugVal) continue
    const description = locString(p.excerpt, locale) || undefined
    posts.push({
      id: `p-${String(p._id)}`,
      label,
      description,
      to: `/${slugVal}`
    })
  }

  return { menus, posts }
})
