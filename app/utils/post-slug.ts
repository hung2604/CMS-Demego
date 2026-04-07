/** Slug URL-safe (đồng bộ với form tạo/sửa bài). */
export function toPostSlug (val: string): string {
  return val
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * API POST/PUT bài viết bắt buộc slug.vi và slug.en đều khác rỗng.
 * Gộp từ tiêu đề / slug ngôn ngữ kia khi một bên thiếu (nội dung một ngôn ngữ vẫn lưu được).
 */
export function finalizeBilingualSlugs (
  slug: { vi: string; en: string },
  title: { vi: string; en: string }
): { vi: string; en: string } | null {
  let vi = slug.vi.trim()
  let en = slug.en.trim()
  if (!vi) vi = toPostSlug(title.vi) || en
  if (!en) en = toPostSlug(title.en) || vi
  if (!vi || !en) return null
  return { vi, en }
}
