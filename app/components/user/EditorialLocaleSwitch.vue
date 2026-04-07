<script setup lang="ts">
const { locale, setLocale, t } = useI18n()

const options = [
  { code: 'vi' as const, label: 'Tiếng Việt' },
  { code: 'en' as const, label: 'English' }
]
</script>

<template>
  <div
    class="inline-flex items-center gap-0.5 rounded-full border border-ed-outline-variant/20 bg-ed-surface-container-low/80 p-0.5"
    role="group"
    :aria-label="t('locale.switch')"
  >
    <button
      v-for="opt in options"
      :key="opt.code"
      type="button"
      class="rounded-full px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors"
      :class="
        locale === opt.code
          ? 'bg-ed-surface-container-lowest text-ed-primary shadow-sm dark:bg-slate-600 dark:text-blue-200'
          : 'text-ed-on-surface-variant hover:text-ed-on-surface dark:text-slate-400'
      "
      :aria-pressed="locale === opt.code"
      :aria-label="opt.label"
      @click="setLocale(opt.code)"
    >
      {{ opt.code }}
    </button>
  </div>
</template>
