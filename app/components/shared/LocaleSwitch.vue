<script setup lang="ts">
const { locale, setLocale, t } = useI18n()

const options = [
  { code: 'vi' as const, icon: 'i-circle-flags-vn', label: 'Tiếng Việt' },
  { code: 'en' as const, icon: 'i-circle-flags-gb', label: 'English' }
]
</script>

<template>
  <div
    class="inline-flex items-center gap-0.5 rounded-lg border border-default bg-elevated/50 p-0.5"
    role="group"
    :aria-label="t('locale.switch')"
  >
    <UTooltip v-for="opt in options" :key="opt.code" :text="opt.label">
      <UButton
        square
        size="sm"
        :variant="locale === opt.code ? 'solid' : 'ghost'"
        :color="locale === opt.code ? 'primary' : 'neutral'"
        class="h-9 w-9 shrink-0 justify-center !gap-0 rounded-md"
        :class="locale === opt.code ? '' : 'opacity-75 hover:opacity-100'"
        :aria-label="opt.label"
        :aria-pressed="locale === opt.code"
        @click="setLocale(opt.code)"
      >
        <UIcon :name="opt.icon" class="size-6 shrink-0 leading-none [&_svg]:block" />
      </UButton>
    </UTooltip>
  </div>
</template>
