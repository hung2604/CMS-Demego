/** Tránh chuỗi tìm kiếm làm regex nguy hiểm / ReDoS */
export function escapeRegex (s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
