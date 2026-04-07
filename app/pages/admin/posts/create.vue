<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { t } = useI18n()
const router = useRouter()
const toast = useToast()

useSeoMeta({ title: `${t('admin.create')} ${t('admin.posts')}` })

const langTab = ref<'vi' | 'en'>('vi')

const { data: postsData } = await useFetch('/api/posts', { query: { limit: 200 } })
const posts = computed(() => (postsData.value as { posts?: unknown[] })?.posts ?? [])

const neighborPostOptions = computed(() => [
  { label: t('post.neighborNone'), value: null },
  ...posts.value.map((p: { _id: unknown; title?: { vi?: string; en?: string } }) => ({
    label: p.title?.vi || p.title?.en || '—',
    value: String(p._id)
  }))
])

const form = reactive({
  title: { vi: '', en: '' },
  slug: { vi: '', en: '' },
  content: { vi: '', en: '' },
  excerpt: { vi: '', en: '' },
  status: 'draft' as 'draft' | 'published',
  menuId: null as string | null,
  prevPostId: null as string | null,
  nextPostId: null as string | null,
  seo: {
    vi: { title: '', description: '' },
    en: { title: '', description: '' }
  }
})

const slugManuallyEdited = reactive({ vi: false, en: false })

function toSlug(val: string) {
  return val
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

watch(() => form.title.vi, (val) => { if (!slugManuallyEdited.vi) form.slug.vi = toSlug(val) })
watch(() => form.title.en, (val) => { if (!slugManuallyEdited.en) form.slug.en = toSlug(val) })

const saving = ref(false)
const { openCustomerPreview } = usePostPreview()

async function previewAsVisitor() {
  await openCustomerPreview({
    langTab: langTab.value,
    form,
    posts: posts.value
  })
}

async function save() {
  saving.value = true
  try {
    const post = await $fetch('/api/posts', { method: 'POST', body: form })
    toast.add({ title: t('common.success'), color: 'success' })
    router.push(`/admin/posts/${(post as any)._id}`)
  } catch (e: any) {
    toast.add({ title: e?.data?.statusMessage || t('common.error'), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <UDashboardNavbar :title="`${t('admin.create')} ${t('admin.posts')}`" icon="i-lucide-plus">
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
            <UInput v-model="form.slug.vi" :placeholder="t('post.slug')" class="w-full" @input="slugManuallyEdited.vi = true" />
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
            <UInput v-model="form.slug.en" :placeholder="t('post.slug')" class="w-full" @input="slugManuallyEdited.en = true" />
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
