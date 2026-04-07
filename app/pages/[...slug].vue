<script setup lang="ts">
import { buildMenuTree, findMenuPathById, normalizeMenuDocId } from '~/utils/menu-tree'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const slug = computed(() => {
  const parts = route.params.slug
  return Array.isArray(parts) ? parts.join('/') : parts
})

const { data: post, error, refresh } = await useFetch(
  () => `/api/posts/slug/${slug.value}`,
  { query: computed(() => ({ locale: locale.value })) }
)

const menuLoc = computed(() => (locale.value === 'en' ? 'en' : 'vi') as const)
const { data: menus } = await useFetch<Record<string, unknown>[]>('/api/menus', {
  key: 'menus',
  default: () => [],
  transform: (payload) => (Array.isArray(payload) ? payload : [])
})
const menuTree = computed(() => buildMenuTree(menus.value, false, menuLoc.value))

const breadcrumbTrail = computed(() => {
  const raw = (post.value as { menuId?: unknown } | null)?.menuId
  const id = raw != null ? normalizeMenuDocId(raw) : ''
  if (!id) return null
  const path = findMenuPathById(menuTree.value, id)
  if (!path?.length) return null
  return path.map((n) => ({ title: n.title, slug: n.slug, icon: n.icon }))
})

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

/** Đồng bộ với sidebar: mở nhánh & highlight mục menu gắn bài (posts.menuId). */
const editorialActiveMenuId = useState<string | null>('editorialActiveMenuId', () => null)

watch(
  () => (post.value as { menuId?: unknown } | null)?.menuId,
  (raw) => {
    const id = raw != null ? normalizeMenuDocId(raw) : ''
    editorialActiveMenuId.value = id !== '' ? id : null
  },
  { immediate: true }
)

onUnmounted(() => {
  editorialActiveMenuId.value = null
})

useSeoMeta({
  title: computed(() => (post.value as any)?.seo?.title || (post.value as any)?.title),
  description: computed(() => (post.value as any)?.seo?.description || (post.value as any)?.excerpt),
  ogTitle: computed(() => (post.value as any)?.seo?.title || (post.value as any)?.title),
  ogDescription: computed(() => (post.value as any)?.seo?.description || (post.value as any)?.excerpt)
})

watch(locale, async (newLocale) => {
  await refresh()
  const alternateSlugs = (post.value as any)?.alternateSlugs
  if (!alternateSlugs) return
  const targetSlug = alternateSlugs[newLocale]
  if (targetSlug && targetSlug !== slug.value) {
    await router.replace(`/${targetSlug}`)
  }
})
</script>

<template>
  <PostPublicArticle
    v-if="post"
    :title="(post as any).title"
    :content="(post as any).content"
    :created-at="(post as any).createdAt"
    :updated-at="(post as any).updatedAt"
    :prev="(post as any).prev"
    :next="(post as any).next"
    :breadcrumb-trail="breadcrumbTrail"
  />
</template>
