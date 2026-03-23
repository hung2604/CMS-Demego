<script setup lang="ts">
const props = defineProps<{
  /** Tiêu đề trang hiện tại (mục cuối, không phải link). */
  currentTitle?: string | null
}>()

const route = useRoute()

const crumbs = computed(() => {
  const path = route.path.replace(/\/$/, '') || '/'
  if (path === '/') {
    return [] as { to: string; title: string }[]
  }
  const segments = path.split('/').filter(Boolean)
  const out: { to: string; title: string }[] = [{ to: '/', title: 'Trang chủ' }]
  let acc = ''
  for (const seg of segments) {
    acc += `/${seg}`
    const raw = decodeURIComponent(seg).replace(/-/g, ' ')
    const label = raw.charAt(0).toUpperCase() + raw.slice(1)
    out.push({ to: acc, title: label })
  }
  return out
})

const lastFallback = computed(() => {
  const c = crumbs.value
  if (!c.length) {
    return ''
  }
  return c[c.length - 1]!.title
})

const displayTitle = computed(
  () => (props.currentTitle?.trim() || lastFallback.value),
)
</script>

<template>
  <nav
    v-if="crumbs.length > 1"
    class="mb-8 flex flex-wrap items-center gap-2 text-sm font-medium text-on-surface-variant dark:text-slate-400"
  >
    <template
      v-for="(c, i) in crumbs"
      :key="c.to"
    >
      <template v-if="i < crumbs.length - 1">
        <NuxtLink
          :to="c.to"
          class="transition-colors hover:text-primary dark:hover:text-blue-300"
        >
          {{ c.title }}
        </NuxtLink>
        <span class="material-symbols-outlined text-xs text-on-surface-variant dark:text-slate-500">chevron_right</span>
      </template>
      <span
        v-else
        class="text-on-surface dark:text-slate-100"
      >{{ displayTitle }}</span>
    </template>
  </nav>
</template>
