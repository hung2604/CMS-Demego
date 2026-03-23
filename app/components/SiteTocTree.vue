<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

const props = withDefaults(
  defineProps<{
    links: TocLink[]
    depth?: number
    /** Đường dẫn trang (hash neo tới heading trong bài). */
    basePath: string
  }>(),
  { depth: 0 },
)

const route = useRoute()

const activeId = computed(() => (route.hash || '').replace(/^#/, ''))

function hrefFor(id: string) {
  const path = props.basePath || '/'
  return `${path}#${id}`
}

function isActive(id: string) {
  return activeId.value === id
}

const linkBase =
  'flex items-center gap-3 rounded-r-lg py-2 px-4 text-[0.875rem] transition-all duration-200 -ml-[1.5px] border-l-2'
const linkActive =
  'border-primary bg-primary/5 font-semibold text-primary dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-300'
const linkIdle =
  'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
</script>

<template>
  <ul
    class="list-none space-y-1 border-l border-outline-variant/20 p-0 dark:border-slate-600"
    :class="depth > 0 ? 'ml-2 mt-1 border-l pl-2' : ''"
  >
    <li
      v-for="(link, idx) in links"
      :key="`${depth}-${idx}-${link.id}`"
    >
      <NuxtLink
        :to="hrefFor(link.id)"
        :class="[
          linkBase,
          isActive(link.id) ? linkActive : linkIdle,
        ]"
      >
        {{ link.text }}
      </NuxtLink>
      <SiteTocTree
        v-if="link.children?.length"
        :links="link.children"
        :depth="depth + 1"
        :base-path="basePath"
      />
    </li>
  </ul>
</template>
