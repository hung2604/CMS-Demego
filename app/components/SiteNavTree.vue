<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const props = withDefaults(
  defineProps<{
    items: ContentNavigationItem[]
    depth?: number
  }>(),
  { depth: 0 },
)

const icons = ['rocket_launch', 'architecture', 'api', 'school', 'verified'] as const

function iconFor(node: ContentNavigationItem, index: number): string {
  if (props.depth > 0) {
    return 'chevron_right'
  }
  if (!node.path) {
    return 'folder'
  }
  return icons[index % icons.length]!
}
</script>

<template>
  <ul
    class="list-none space-y-1 p-0"
    :class="depth > 0 ? 'mt-1 ml-2 border-l border-outline-variant/30 pl-3 dark:border-slate-600' : ''"
  >
    <li
      v-for="(node, idx) in items"
      :key="`${depth}-${idx}-${node.path ?? node.stem ?? ''}-${node.title}`"
    >
      <NuxtLink
        v-if="node.path"
        :to="node.path"
        class="flex items-center gap-3 rounded-lg px-4 py-3 font-body text-[0.875rem] leading-6 transition-all duration-300 ease-in-out text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200"
        active-class="!bg-surface-container-lowest !font-bold !text-primary !shadow-sm dark:!bg-slate-700 dark:!text-blue-300"
      >
        <span class="material-symbols-outlined text-xl">{{ iconFor(node, idx) }}</span>
        <span>{{ node.title }}</span>
      </NuxtLink>
      <span
        v-else
        class="flex items-center gap-3 px-4 py-3 font-body text-[0.65rem] font-bold uppercase leading-6 tracking-[0.1em] text-on-surface-variant/80 dark:text-slate-500"
      >
        <span class="material-symbols-outlined text-lg">folder</span>
        <span>{{ node.title }}</span>
      </span>
      <SiteNavTree
        v-if="node.children?.length"
        :items="node.children"
        :depth="depth + 1"
      />
    </li>
  </ul>
</template>
