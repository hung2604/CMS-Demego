import type { Toc } from '@nuxt/content'

/** Mục lục (TOC) của trang markdown hiện tại — đồng bộ giữa trang và sidebar. */
export function usePageToc() {
  return useState<Toc | null>('page-table-of-contents', () => null)
}
