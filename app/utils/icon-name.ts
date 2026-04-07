/**
 * Iconify search/API dùng dạng "collection:name" (vd: lucide:house).
 * Nuxt Icon / UIcon dùng "i-collection-name" (vd: i-lucide-house).
 */

const MULTI_PART_PREFIXES = [
  'simple-icons',
  'circle-flags',
  'heroicons-solid',
  'heroicons-outline',
  'streamline-emojis',
  'icon-park-solid',
  'icon-park-outline'
].sort((a, b) => b.length - a.length)

export function iconifyNameToUiIcon (name: string | null | undefined): string {
  if (!name || typeof name !== 'string') return 'i-lucide-file-text'
  const s = name.trim()
  if (!s) return 'i-lucide-file-text'
  if (s.startsWith('i-')) return s
  const parts = s.split(':', 2)
  if (parts.length === 2) return `i-${parts[0]}-${parts[1]}`
  return `i-lucide-${s.replace(/^lucide-?/i, '')}`
}

export function uiIconToIconifyName (ui: string | null | undefined): string {
  if (!ui || typeof ui !== 'string') return 'lucide:file-text'
  const s = ui.trim()
  if (!s) return 'lucide:file-text'
  if (s.includes(':')) return s
  if (!s.startsWith('i-')) return `lucide:${s}`
  const rest = s.slice(2)
  for (const prefix of MULTI_PART_PREFIXES) {
    if (rest.startsWith(prefix + '-')) {
      return `${prefix}:${rest.slice(prefix.length + 1)}`
    }
  }
  const i = rest.indexOf('-')
  if (i === -1) return `lucide:${rest}`
  return `${rest.slice(0, i)}:${rest.slice(i + 1)}`
}
