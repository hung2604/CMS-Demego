import type { MenuLocale } from '../../utils/menu-title'
import { resolveMenuTitle } from '../../utils/menu-title'

/**
 * Chuẩn hóa cây menu phẳng từ API (parentId / _id có thể null, undefined, "", ObjectId).
 */
export function normalizeMenuParentKey (parentId: unknown): string | null {
  if (parentId == null) return null
  const s = String(parentId).trim()
  if (s === '' || s === 'null' || s === 'undefined') return null
  return s
}

export function normalizeMenuDocId (id: unknown): string {
  if (id == null) return ''
  if (typeof id === 'object' && id !== null && '$oid' in id) {
    return String((id as { $oid: string }).$oid)
  }
  return String(id)
}

export type MenuTreeNode = {
  _id: string
  title: string
  slug?: string
  icon?: string
  children: MenuTreeNode[]
}

/**
 * @param keepFields true: giữ field gốc (title song ngữ, postId, createdAt…) cho trang admin
 * @param locale locale hiển thị khi keepFields === false (site, nav)
 */
export function buildMenuTree (
  raw: Record<string, unknown>[] | null | undefined,
  keepFields = false,
  locale: MenuLocale = 'vi'
): MenuTreeNode[] {
  const items = Array.isArray(raw) ? raw : []
  function build (parentKey: string | null): MenuTreeNode[] {
    return items
      .filter((i) => normalizeMenuParentKey(i.parentId) === parentKey)
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
      .map((item) => {
        const id = normalizeMenuDocId(item._id)
        const children = build(id)
        const slug = item.slug != null && String(item.slug).trim() !== '' ? String(item.slug) : undefined
        const icon = item.icon != null ? String(item.icon) : undefined
        if (keepFields) {
          return {
            ...item,
            _id: id,
            slug,
            icon,
            children
          } as MenuTreeNode
        }
        return {
          _id: id,
          title: resolveMenuTitle(item as Record<string, unknown>, locale),
          slug,
          icon,
          children
        }
      })
  }
  return build(null)
}
