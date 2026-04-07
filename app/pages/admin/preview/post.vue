<script setup lang="ts">
import { POST_PREVIEW_STORAGE_KEY, type PostPreviewPayload } from '~/composables/usePostPreview'

definePageMeta({ layout: 'default' })

const { t, locale, setLocale } = useI18n()

const payload = ref<PostPreviewPayload | null>(null)
const missing = ref(false)

onMounted(() => {
  try {
    const raw = sessionStorage.getItem(POST_PREVIEW_STORAGE_KEY)
    if (!raw) {
      missing.value = true
      return
    }
    const p = JSON.parse(raw) as PostPreviewPayload
    payload.value = p
    if (p.locale && p.locale !== locale.value) {
      void setLocale(p.locale)
    }
  } catch {
    missing.value = true
  }
})

useSeoMeta({
  title: computed(() =>
    payload.value ? `${t('admin.previewTitle')} — ${payload.value.title}` : t('admin.previewTitle')
  )
})

async function backToEdit() {
  const p = payload.value
  if (!p?.returnPath) {
    await navigateTo('/admin/posts')
    return
  }
  if (p.returnLocale && p.returnLocale !== locale.value) {
    await setLocale(p.returnLocale as 'vi' | 'en')
  }
  await navigateTo(p.returnPath)
}
</script>

<template>
  <div>
    <div
      v-if="missing"
      class="mx-auto max-w-3xl px-4 py-24 text-center text-ed-on-surface-variant dark:text-slate-400"
    >
      <p class="font-ed-body text-base">
        {{ t('admin.previewMissing') }}
      </p>
      <NuxtLink
        to="/admin/posts"
        class="mt-6 inline-flex items-center gap-2 font-ed-headline text-sm font-semibold text-ed-primary hover:underline dark:text-blue-300"
      >
        <span class="material-symbols-ed text-lg">arrow_back</span>
        {{ t('admin.posts') }}
      </NuxtLink>
    </div>

    <template v-else-if="payload">
      <PostPublicArticle
        :title="payload.title"
        :content="payload.content"
        :created-at="payload.createdAt"
        :updated-at="payload.updatedAt"
        :prev="payload.prev"
        :next="payload.next"
      />

      <button
        type="button"
        class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-ed-outline-variant/30 bg-ed-surface-container-lowest px-4 py-2.5 font-ed-headline text-sm font-semibold text-ed-on-surface shadow-lg shadow-ed-on-surface/5 transition hover:border-ed-primary/35 hover:bg-ed-surface-container-low dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:shadow-black/20 dark:hover:border-blue-500/40"
        @click="backToEdit"
      >
        <span class="material-symbols-ed text-lg">arrow_back</span>
        {{ t('admin.backToEdit') }}
      </button>
    </template>
  </div>
</template>
