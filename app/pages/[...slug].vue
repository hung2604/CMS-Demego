<script setup lang="ts">
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

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

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
    :prev="(post as any).prev"
    :next="(post as any).next"
  />
</template>
