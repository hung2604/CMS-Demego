<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { t } = useI18n()
const toast = useToast()

useSeoMeta({ title: t('storage.title') })

type BlobRow = {
  url: string
  pathname: string
  size: number
  uploadedAt: string
}

const PREFIX_OPTIONS = [
  { value: 'cms/', labelKey: 'storage.prefixAll' },
  { value: 'cms/posts/', labelKey: 'storage.prefixPosts' },
  { value: 'cms/settings/logo/', labelKey: 'storage.prefixLogo' },
  { value: 'cms/settings/favicon/', labelKey: 'storage.prefixFavicon' }
] as const

const prefix = ref<string>('cms/')
const customPrefix = ref('')
const useCustomPrefix = ref(false)

const effectivePrefix = computed(() =>
  useCustomPrefix.value ? (customPrefix.value.trim() || 'cms/') : prefix.value
)

const nameFilter = ref('')
const blobs = ref<BlobRow[]>([])
const cursor = ref<string | undefined>(undefined)
const hasMore = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

const filteredBlobs = computed(() => {
  const q = nameFilter.value.trim().toLowerCase()
  if (!q) return blobs.value
  return blobs.value.filter(b => b.pathname.toLowerCase().includes(q))
})

function isPreviewableImage (pathname: string): boolean {
  const p = pathname.toLowerCase()
  return /\.(png|jpe?g|gif|webp|svg|ico)$/.test(p)
}

function formatBytes (n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

async function loadPage (reset: boolean) {
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<{
      blobs: BlobRow[]
      cursor?: string
      hasMore: boolean
    }>('/api/storage/blobs', {
      query: {
        prefix: effectivePrefix.value,
        limit: 48,
        ...(reset ? {} : { cursor: cursor.value })
      }
    })
    if (reset) {
      blobs.value = res.blobs
    } else {
      blobs.value = [...blobs.value, ...res.blobs]
    }
    cursor.value = res.cursor
    hasMore.value = res.hasMore
  } catch (e: unknown) {
    const msg = e && typeof e === 'object' && 'data' in e
      ? String((e as { data?: { statusMessage?: string } }).data?.statusMessage ?? '')
      : ''
    error.value = msg || t('common.error')
    if (reset) blobs.value = []
    toast.add({ title: error.value, color: 'error' })
  } finally {
    loading.value = false
  }
}

watch(effectivePrefix, () => {
  loadPage(true)
})

watch(useCustomPrefix, v => {
  if (v) customPrefix.value = prefix.value
})

onMounted(() => {
  loadPage(true)
})

async function copyUrl (url: string) {
  try {
    await navigator.clipboard.writeText(url)
    toast.add({ title: t('storage.copied'), color: 'success' })
  } catch {
    toast.add({ title: t('common.error'), color: 'error' })
  }
}
</script>

<template>
  <div>
    <UDashboardNavbar :title="t('storage.title')" icon="i-lucide-images">
      <template #right>
        <UButton
          icon="i-lucide-refresh-cw"
          size="sm"
          variant="outline"
          :loading="loading"
          @click="loadPage(true)"
        >
          {{ t('storage.refresh') }}
        </UButton>
      </template>
    </UDashboardNavbar>

    <div class="space-y-6 p-6">
      <p class="text-muted max-w-2xl text-sm">
        {{ t('storage.intro') }}
      </p>

      <div class="flex flex-col gap-4 lg:flex-row lg:items-end">
        <UFormField
          v-if="!useCustomPrefix"
          :label="t('storage.prefixLabel')"
          class="min-w-[240px]"
        >
          <USelectMenu
            v-model="prefix"
            value-key="value"
            :items="PREFIX_OPTIONS.map(o => ({
              value: o.value,
              label: t(o.labelKey)
            }))"
            class="w-full"
          />
        </UFormField>

        <div v-else class="flex min-w-[240px] flex-1 flex-col gap-1">
          <UFormField :label="t('storage.prefixCustom')">
            <UInput
              v-model="customPrefix"
              placeholder="cms/posts/"
              class="w-full font-mono text-sm"
            />
          </UFormField>
        </div>

        <UCheckbox
          v-model="useCustomPrefix"
          :label="t('storage.useCustomPrefix')"
        />

        <UFormField :label="t('storage.filterName')" class="min-w-[200px] flex-1">
          <UInput
            v-model="nameFilter"
            icon="i-lucide-filter"
            :placeholder="t('storage.filterPlaceholder')"
            class="w-full"
          />
        </UFormField>
      </div>

      <UAlert
        v-if="error && !blobs.length"
        color="error"
        variant="subtle"
        :title="t('common.error')"
        :description="error"
      />

      <div
        v-if="!filteredBlobs.length && !loading"
        class="text-muted border-default rounded-lg border border-dashed py-16 text-center text-sm"
      >
        {{ t('storage.empty') }}
      </div>

      <div
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
      >
        <div
          v-for="b in filteredBlobs"
          :key="b.pathname"
          class="border-default bg-default flex flex-col overflow-hidden rounded-lg border"
        >
          <div class="bg-muted/30 relative aspect-video">
            <img
              v-if="isPreviewableImage(b.pathname)"
              :src="b.url"
              :alt="b.pathname"
              class="size-full object-contain"
              loading="lazy"
            >
            <div
              v-else
              class="text-muted flex size-full items-center justify-center"
            >
              <UIcon name="i-lucide-file" class="size-10" />
            </div>
            <UButton
              class="absolute top-2 right-2"
              size="xs"
              color="neutral"
              variant="solid"
              icon="i-lucide-external-link"
              :to="b.url"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="t('storage.openImage')"
            />
          </div>
          <div class="flex flex-1 flex-col gap-2 p-3">
            <p
              class="line-clamp-2 font-mono text-xs break-all text-muted"
              :title="b.pathname"
            >
              {{ b.pathname }}
            </p>
            <div class="text-muted flex flex-wrap gap-x-3 text-xs">
              <span>{{ formatBytes(b.size) }}</span>
              <span>{{ new Date(b.uploadedAt).toLocaleString() }}</span>
            </div>
            <UButton
              block
              size="sm"
              icon="i-lucide-copy"
              @click="copyUrl(b.url)"
            >
              {{ t('storage.copyUrl') }}
            </UButton>
          </div>
        </div>
      </div>

      <div v-if="hasMore" class="flex justify-center">
        <UButton
          :loading="loading"
          variant="outline"
          @click="loadPage(false)"
        >
          {{ t('storage.loadMore') }}
        </UButton>
      </div>
    </div>
  </div>
</template>
