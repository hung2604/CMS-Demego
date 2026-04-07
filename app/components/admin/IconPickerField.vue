<script setup lang="ts">
import IconPicker from 'iconify-icon-picker'
import 'iconify-icon-picker/style.css'
import { iconifyNameToUiIcon, uiIconToIconifyName } from '~/utils/icon-name'

const { t } = useI18n()

const model = defineModel<string>({ default: '' })

const pickOpen = ref(false)

const pickerValue = computed({
  get: () => uiIconToIconifyName(model.value),
  set: (v: string) => {
    model.value = iconifyNameToUiIcon(v)
  }
})

const previewIcon = computed(() => iconifyNameToUiIcon(model.value))
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-wrap items-center gap-2">
      <div class="flex size-9 shrink-0 items-center justify-center rounded-md border border-default bg-elevated">
        <UIcon :name="previewIcon" class="size-5 text-primary" />
      </div>
      <UInput
        v-model="model"
        :placeholder="t('menu.iconPlaceholder')"
        class="min-w-0 flex-1 font-mono text-sm"
      />
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-search"
        class="shrink-0"
        @click="pickOpen = true"
      >
        {{ t('menu.pickIcon') }}
      </UButton>
    </div>
    <p class="text-xs text-muted">
      {{ t('menu.iconPickerHint') }}
    </p>

    <UModal v-model:open="pickOpen">
      <template #content>
        <div class="p-4 sm:p-5">
          <div class="mb-3 flex items-center justify-between gap-2">
            <h4 class="text-highlighted text-sm font-semibold">
              {{ t('menu.pickIcon') }}
            </h4>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              size="xs"
              :aria-label="t('admin.cancel')"
              @click="pickOpen = false"
            />
          </div>
          <ClientOnly>
            <div
              class="icon-picker-nuxtui max-h-[min(420px,50vh)] overflow-y-auto rounded-lg border border-default bg-default p-3"
            >
              <IconPicker
                v-model="pickerValue"
                :placeholder="t('menu.iconSearchPlaceholder')"
                :items-per-page="24"
                @onSelect="pickOpen = false"
              />
            </div>
            <template #fallback>
              <div class="text-muted flex items-center justify-center py-8 text-sm">
                {{ t('common.loading') }}
              </div>
            </template>
          </ClientOnly>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.icon-picker-nuxtui :deep(.icon-picker) {
  --iconPicker-text: var(--ui-text);
  --iconPicker-border: var(--ui-border);
  --iconPicker-primary: var(--ui-primary);
  --iconPicker-primary-fg: var(--ui-text-inverted);
  --iconPicker-primary-hover: color-mix(in oklab, var(--ui-primary) 85%, black);
  --iconPicker-selected-bg: var(--ui-bg-elevated);
  --iconPicker-font-base: 14px;
}
</style>
