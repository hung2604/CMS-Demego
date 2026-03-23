<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

defineProps<{
  activeRoot: ContentNavigationItem | null
  items: ContentNavigationItem[]
}>()

const route = useRoute()
const pageToc = usePageToc()

const tocLinks = computed(() => pageToc.value?.links?.filter(Boolean) ?? [])
const hasToc = computed(() => tocLinks.value.length > 0)

const basePath = computed(() => {
  let p = route.path
  if (p.length > 1 && p.endsWith('/')) {
    p = p.slice(0, -1)
  }
  return p || '/'
})
</script>

<template>
  <aside
    class="hidden w-64 shrink-0 self-start xl:block"
    :aria-label="hasToc ? 'Mục lục bài viết' : 'Trang trong mục'"
  >
    <div class="sticky top-32 p-2">
      <template v-if="hasToc">
        <h4
          class="mb-6 flex items-center gap-2 text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/60 dark:text-slate-500"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-primary" />
          Trên trang này
        </h4>
        <nav aria-label="Liên kết tới các phần trong bài">
          <SiteTocTree
            :links="tocLinks"
            :base-path="basePath"
          />
        </nav>
        <div class="mt-8 border-t border-outline-variant/20 pt-6 dark:border-slate-700">
          <button
            type="button"
            class="group flex w-full items-center justify-between px-2 text-[0.75rem] font-bold text-on-surface-variant transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-blue-300"
          >
            <span>Sửa trang này</span>
            <span class="material-symbols-outlined text-sm opacity-0 transition-opacity group-hover:opacity-100">edit</span>
          </button>
          <button
            type="button"
            class="group mt-4 flex w-full items-center justify-between px-2 text-[0.75rem] font-bold text-on-surface-variant transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-blue-300"
          >
            <span>Góp ý</span>
            <span class="material-symbols-outlined text-sm opacity-0 transition-opacity group-hover:opacity-100">forum</span>
          </button>
        </div>
      </template>

      <template v-else-if="items.length && activeRoot">
        <h4
          class="mb-6 flex items-center gap-2 text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/60 dark:text-slate-500"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-primary" />
          Trong mục
        </h4>
        <p class="font-headline text-base font-bold text-on-surface dark:text-slate-100">
          {{ activeRoot.title }}
        </p>
        <div class="mt-4">
          <SiteNavTree :items="items" />
        </div>
      </template>

      <template v-else>
        <p class="text-sm text-on-surface-variant dark:text-slate-400">
          Không có mục lục hoặc trang con.
        </p>
      </template>
    </div>
  </aside>
</template>
