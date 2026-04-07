<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { t } = useI18n()
const route = useRoute()
const toast = useToast()

const postId = route.params.id as string

const { data: post, error } = await useFetch(`/api/posts/${postId}`)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

const raw = computed(() => post.value as any)

useSeoMeta({ title: computed(() => `${t('admin.edit')} - ${raw.value?.title?.vi ?? ''}`) })

const { data: postsData } = await useFetch('/api/posts', { query: { limit: 200 } })
const posts = computed(() => (postsData.value as { posts?: unknown[] })?.posts ?? [])

const neighborPostOptions = computed(() => [
  { label: t('post.neighborNone'), value: null },
  ...posts.value
    .filter((p: { _id: unknown }) => String(p._id) !== postId)
    .map((p: { _id: unknown; title?: { vi?: string; en?: string } }) => ({
      label: p.title?.vi || p.title?.en || '—',
      value: String(p._id)
    }))
])

const langTab = ref<'vi' | 'en'>('vi')

function idToStr(v: unknown) {
  if (v == null || v === '') return null
  return String(v)
}

const form = reactive({
  title: { vi: raw.value?.title?.vi ?? '', en: raw.value?.title?.en ?? '' },
  slug: { vi: raw.value?.slug?.vi ?? '', en: raw.value?.slug?.en ?? '' },
  content: { vi: raw.value?.content?.vi ?? '', en: raw.value?.content?.en ?? '' },
  excerpt: { vi: raw.value?.excerpt?.vi ?? '', en: raw.value?.excerpt?.en ?? '' },
  status: (raw.value?.status ?? 'draft') as 'draft' | 'published',
  menuId: raw.value?.menuId ?? null,
  prevPostId: idToStr(raw.value?.prevPostId),
  nextPostId: idToStr(raw.value?.nextPostId),
  seo: {
    vi: { title: raw.value?.seo?.vi?.title ?? '', description: raw.value?.seo?.vi?.description ?? '' },
    en: { title: raw.value?.seo?.en?.title ?? '', description: raw.value?.seo?.en?.description ?? '' }
  }
})

const saving = ref(false)
const { openCustomerPreview } = usePostPreview()

async function previewAsVisitor() {
  await openCustomerPreview({
    langTab: langTab.value,
    form,
    posts: posts.value,
    createdAt: raw.value?.createdAt ?? null
  })
}

async function save() {
  saving.value = true
  try {
    await $fetch(`/api/posts/${postId}`, { method: 'PUT', body: form })
    toast.add({ title: t('common.success'), color: 'success' })
  } catch (e: any) {
    toast.add({ title: e?.data?.statusMessage || t('common.error'), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="post">
    <UDashboardNavbar :title="`${t('admin.edit')} - ${raw?.title?.vi ?? ''}`" icon="i-lucide-pencil">
      <template #right>
        <UButton variant="outline" to="/admin/posts" icon="i-lucide-arrow-left" size="sm">
          {{ t('common.back') }}
        </UButton>
        <UButton variant="outline" icon="i-lucide-eye" size="sm" @click="previewAsVisitor">
          {{ t('admin.previewAsVisitor') }}
        </UButton>
        <UButton icon="i-lucide-save" size="sm" :loading="saving" @click="save">
          {{ t('admin.save') }}
        </UButton>
      </template>
    </UDashboardNavbar>

    <div class="p-6 w-full max-w-none space-y-6">
      <!-- Status -->
      <UFormField :label="t('post.status')">
        <USelect
          v-model="form.status"
          :items="[
            { label: t('admin.status.draft'), value: 'draft' },
            { label: t('admin.status.published'), value: 'published' }
          ]"
          class="w-44"
        />
      </UFormField>

      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField :label="t('post.prevPost')">
          <USelect v-model="form.prevPostId" :items="neighborPostOptions" class="w-full" />
        </UFormField>
        <UFormField :label="t('post.nextPost')">
          <USelect v-model="form.nextPostId" :items="neighborPostOptions" class="w-full" />
        </UFormField>
      </div>

      <USeparator />

      <!-- Lang tabs -->
      <div>
        <div class="flex items-center gap-1 border-b border-default mb-6">
          <button
            v-for="tab in [{ value: 'vi', label: t('post.langTab.vi'), icon: 'i-circle-flags-vn' }, { value: 'en', label: t('post.langTab.en'), icon: 'i-circle-flags-gb' }]"
            :key="tab.value"
            class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
            :class="langTab === tab.value
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-default'"
            @click="langTab = tab.value as 'vi' | 'en'"
          >
            <UIcon :name="tab.icon" class="size-4" />
            {{ tab.label }}
          </button>
        </div>

        <!-- VI -->
        <div v-show="langTab === 'vi'" class="space-y-5">
          <UFormField :label="t('post.title')">
            <UInput v-model="form.title.vi" :placeholder="t('post.title')" class="w-full" />
          </UFormField>
          <UFormField :label="t('post.slug')">
            <UInput v-model="form.slug.vi" :placeholder="t('post.slug')" class="w-full" />
          </UFormField>
          <UFormField :label="t('post.excerpt')">
            <UTextarea v-model="form.excerpt.vi" :placeholder="t('post.excerpt')" :rows="3" class="w-full" />
          </UFormField>
          <UFormField :label="t('post.content')">
            <ClientOnly>
              <AdminPostEditor v-model="form.content.vi" :placeholder="t('post.content')" />
              <template #fallback>
                <div class="border border-default rounded-xl min-h-[420px] animate-pulse bg-elevated/40" />
              </template>
            </ClientOnly>
          </UFormField>
          <USeparator />
          <p class="font-semibold text-sm">SEO</p>
          <UFormField label="SEO Title">
            <UInput v-model="form.seo.vi.title" placeholder="SEO Title" class="w-full" />
          </UFormField>
          <UFormField label="SEO Description">
            <UTextarea v-model="form.seo.vi.description" placeholder="SEO Description" :rows="2" class="w-full" />
          </UFormField>
        </div>

        <!-- EN -->
        <div v-show="langTab === 'en'" class="space-y-5">
          <UFormField :label="t('post.title')">
            <UInput v-model="form.title.en" :placeholder="t('post.title')" class="w-full" />
          </UFormField>
          <UFormField :label="t('post.slug')">
            <UInput v-model="form.slug.en" :placeholder="t('post.slug')" class="w-full" />
          </UFormField>
          <UFormField :label="t('post.excerpt')">
            <UTextarea v-model="form.excerpt.en" :placeholder="t('post.excerpt')" :rows="3" class="w-full" />
          </UFormField>
          <UFormField :label="t('post.content')">
            <ClientOnly>
              <AdminPostEditor v-model="form.content.en" :placeholder="t('post.content')" />
              <template #fallback>
                <div class="border border-default rounded-xl min-h-[420px] animate-pulse bg-elevated/40" />
              </template>
            </ClientOnly>
          </UFormField>
          <USeparator />
          <p class="font-semibold text-sm">SEO</p>
          <UFormField label="SEO Title">
            <UInput v-model="form.seo.en.title" placeholder="SEO Title" class="w-full" />
          </UFormField>
          <UFormField label="SEO Description">
            <UTextarea v-model="form.seo.en.description" placeholder="SEO Description" :rows="2" class="w-full" />
          </UFormField>
        </div>
      </div>
    </div>
  </div>
</template>
