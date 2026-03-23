<script setup lang="ts">
const route = useRoute()

const contentPath = computed(() => {
  let p = route.path
  if (p.length > 1 && p.endsWith('/')) {
    p = p.slice(0, -1)
  }
  return p || '/'
})

const { data: page } = await useAsyncData(
  () => `content-page:${contentPath.value}`,
  () => queryCollection('content').path(contentPath.value).first(),
  { watch: [contentPath] },
)

const pageToc = usePageToc()
watchEffect(() => {
  const t = page.value?.body?.toc
  pageToc.value =
    t && Array.isArray(t.links) && t.links.length > 0 ? t : null
})

useSeoMeta({
  title: page.value?.title,
  description: page.value?.description,
})
</script>

<template>
  <article>
    <SiteBreadcrumbs :current-title="page?.title" />
    <div
      v-if="page"
      class="prose prose-editorial prose-lg max-w-none prose-headings:scroll-mt-32 prose-headings:font-headline prose-p:leading-relaxed prose-code:rounded-lg prose-code:bg-surface-container-low prose-code:px-1.5 prose-code:py-0.5 prose-code:text-on-surface prose-code:before:content-none prose-code:after:content-none prose-pre:border-l-4 prose-pre:border-primary prose-pre:bg-inverse-surface prose-pre:text-inverse-on-surface dark:prose-code:bg-slate-800 dark:prose-code:text-slate-100 dark:prose-pre:border-blue-400 dark:prose-pre:bg-slate-950 dark:prose-pre:text-slate-200"
    >
      <ContentRenderer :value="page" />
    </div>
    <p
      v-else
      class="text-on-surface-variant dark:text-slate-400"
    >
      Không tìm thấy trang
      <code class="rounded-lg bg-surface-container-low px-1.5 py-0.5 text-sm text-on-surface dark:bg-slate-800 dark:text-slate-200">{{ contentPath }}</code>.
    </p>
  </article>
</template>
