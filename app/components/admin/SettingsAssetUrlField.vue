<script setup lang="ts">
const props = defineProps<{
  kind: 'logo' | 'favicon'
}>()

const model = defineModel<string>({ default: '' })

const { t } = useI18n()
const toast = useToast()

const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const accept = computed(() =>
  props.kind === 'favicon'
    ? 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/x-icon,.ico'
    : 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml'
)

async function onFileChange (e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('kind', props.kind)
    const res = await $fetch<{ url: string }>('/api/upload/blob', {
      method: 'POST',
      body: fd
    })
    model.value = res.url
    toast.add({ title: t('settings.uploadOk'), color: 'success' })
  } catch (err: any) {
    const statusMsg = err?.data?.statusMessage
    const msg = typeof statusMsg === 'string' ? statusMsg : (err?.message || t('common.error'))
    toast.add({ title: msg, color: 'error' })
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-if="model?.trim()"
      class="flex items-center gap-3 rounded-md border border-default bg-elevated/50 p-2"
    >
      <img
        :src="model.trim()"
        alt=""
        class="max-h-14 max-w-[120px] object-contain"
        loading="lazy"
      >
      <UButton
        color="neutral"
        variant="ghost"
        size="xs"
        icon="i-lucide-trash-2"
        @click="model = ''"
      >
        {{ t('settings.clearImage') }}
      </UButton>
    </div>

    <div class="flex flex-wrap items-stretch gap-2">
      <input
        ref="fileInput"
        type="file"
        class="sr-only"
        :accept="accept"
        :aria-label="t('settings.uploadFile')"
        :disabled="uploading"
        @change="onFileChange"
      >
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-upload"
        :loading="uploading"
        class="shrink-0"
        @click="fileInput?.click()"
      >
        {{ t('settings.uploadFile') }}
      </UButton>
      <UInput
        v-model="model"
        :placeholder="t('settings.urlPlaceholder')"
        class="min-w-[200px] flex-1 font-mono text-sm"
      />
    </div>
    <p class="text-xs text-muted">
      {{ t('settings.assetHint') }}
    </p>
  </div>
</template>
