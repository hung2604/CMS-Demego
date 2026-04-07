export const POST_PREVIEW_STORAGE_KEY = 'cms_demego_post_preview'

export type PostPreviewNeighbor = { slug: string; title: string }

export type PostPreviewPayload = {
  title: string
  content: string
  createdAt?: string | null
  updatedAt?: string | null
  prev?: PostPreviewNeighbor | null
  next?: PostPreviewNeighbor | null
  locale: 'vi' | 'en'
  returnPath: string
  returnLocale: string
}

export type PostPreviewListItem = {
  _id: unknown
  slug?: { vi?: string; en?: string }
  title?: { vi?: string; en?: string }
}

export function resolvePostNeighborForPreview(
  posts: PostPreviewListItem[],
  postId: string | null | undefined,
  lang: 'vi' | 'en'
): PostPreviewNeighbor | null {
  if (postId == null || postId === '') return null
  const p = posts.find((x) => String(x._id) === String(postId))
  if (!p) return null
  const slug = p.slug?.[lang] ?? p.slug?.vi ?? ''
  const title = p.title?.[lang] ?? p.title?.vi ?? ''
  if (!slug) return null
  return { slug, title }
}

export function usePostPreview() {
  const route = useRoute()
  const { locale, setLocale } = useI18n()

  async function openCustomerPreview(args: {
    langTab: 'vi' | 'en'
    form: {
      title: { vi: string; en: string }
      content: { vi: string; en: string }
      prevPostId: string | null
      nextPostId: string | null
    }
    posts: PostPreviewListItem[]
    createdAt?: string | Date | null
    updatedAt?: string | Date | null
  }) {
    const lang = args.langTab
    const prev = resolvePostNeighborForPreview(args.posts, args.form.prevPostId, lang)
    const next = resolvePostNeighborForPreview(args.posts, args.form.nextPostId, lang)
    let createdAtStr: string | null = null
    if (args.createdAt != null && args.createdAt !== '') {
      createdAtStr =
        args.createdAt instanceof Date ? args.createdAt.toISOString() : String(args.createdAt)
    }
    let updatedAtStr: string | null = null
    if (args.updatedAt != null && args.updatedAt !== '') {
      updatedAtStr =
        args.updatedAt instanceof Date ? args.updatedAt.toISOString() : String(args.updatedAt)
    }
    const payload: PostPreviewPayload = {
      title: args.form.title[lang]?.trim() ? args.form.title[lang] : '…',
      content: args.form.content[lang] ?? '',
      createdAt: createdAtStr,
      updatedAt: updatedAtStr,
      prev,
      next,
      locale: lang,
      returnPath: route.fullPath,
      returnLocale: locale.value
    }
    if (!import.meta.client) return
    sessionStorage.setItem(POST_PREVIEW_STORAGE_KEY, JSON.stringify(payload))
    if (locale.value !== lang) {
      await setLocale(lang)
    }
    return navigateTo('/admin/preview/post')
  }

  return { openCustomerPreview }
}
