import type { ContentNavigationItem } from '@nuxt/content'

/** Chuẩn hoá path để so khớp (luôn có leading slash, bỏ trailing slash trừ `/`). */
export function normalizeContentPath(p: string): string {
  if (!p || p === '/') {
    return '/'
  }
  let s = p.startsWith('/') ? p : `/${p}`
  if (s.length > 1 && s.endsWith('/')) {
    s = s.slice(0, -1)
  }
  return s
}

/** Trang hiện tại có nằm trong cây con của `item` (theo path bất kỳ node nào)? */
export function itemContainsRoute(
  item: ContentNavigationItem,
  routePath: string,
): boolean {
  const cur = normalizeContentPath(routePath)
  if (item.path) {
    const ip = normalizeContentPath(item.path)
    if (cur === ip) {
      return true
    }
    if (ip !== '/' && cur.startsWith(`${ip}/`)) {
      return true
    }
  }
  return item.children?.some((ch) => itemContainsRoute(ch, routePath)) ?? false
}

/** Mục gốc chứa route hiện tại (ưu tiên thứ tự trong mảng `roots`). */
export function findActiveRoot(
  roots: ContentNavigationItem[],
  routePath: string,
): ContentNavigationItem | null {
  const hit = roots.find((r) => itemContainsRoute(r, routePath))
  return hit ?? roots[0] ?? null
}
