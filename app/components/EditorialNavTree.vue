<script setup lang="ts">
defineOptions({ name: 'EditorialNavTree' })

export type EditorialNavItem = {
  _id: string
  title: string
  slug?: string
  icon?: string
  children?: EditorialNavItem[]
}

const props = withDefaults(
  defineProps<{
    items: EditorialNavItem[]
    depth?: number
  }>(),
  { depth: 0 }
)

const route = useRoute()

const materialMap: Record<string, string> = {
  'i-lucide-rocket': 'rocket_launch',
  'i-lucide-rocket-launch': 'rocket_launch',
  'i-lucide-home': 'home',
  'i-lucide-house': 'home',
  'i-lucide-book': 'menu_book',
  'i-lucide-book-open': 'menu_book',
  'i-lucide-folder': 'folder',
  'i-lucide-folder-open': 'folder_open',
  'i-lucide-file': 'description',
  'i-lucide-file-text': 'description',
  'i-lucide-newspaper': 'newspaper',
  'i-lucide-layout': 'dashboard',
  'i-lucide-settings': 'settings',
  'i-lucide-wrench': 'build',
  'i-lucide-api': 'api',
  'i-lucide-puzzle': 'extension',
  'i-lucide-lightbulb': 'lightbulb',
  'i-lucide-mail': 'mail',
  'i-lucide-phone': 'call',
  'i-lucide-user': 'person',
  'i-lucide-users': 'groups',
  'i-lucide-link': 'link',
  'i-lucide-external-link': 'open_in_new'
}

function materialIcon(raw?: string): string {
  if (!raw) return 'menu_book'
  const k = raw.trim()
  return materialMap[k] ?? 'menu_book'
}

function isActive(item: EditorialNavItem): boolean {
  if (!item.slug) return false
  const p = `/${item.slug}`
  return route.path === p || route.path.startsWith(`${p}/`)
}

function hasActiveDescendant(item: EditorialNavItem): boolean {
  if (isActive(item)) return true
  return item.children?.some(hasActiveDescendant) ?? false
}

const isNested = computed(() => props.depth > 0)

const nextDepth = computed(() => props.depth + 1)
</script>

<template>
  <nav :class="isNested ? 'space-y-1' : 'space-y-1 pb-10 font-ed-body'">
    <template v-for="item in props.items" :key="item._id">
      <!-- Cấp trong: chỉ liên kết lá -->
      <NuxtLink
        v-if="item.slug && !(item.children?.length) && isNested"
        :to="`/${item.slug}`"
        class="block rounded-md px-3 py-2 text-[0.8125rem] text-ed-on-surface-variant transition-colors hover:bg-ed-surface-container-low hover:text-ed-primary dark:text-slate-400"
        :class="isActive(item) ? '!text-ed-primary !font-semibold bg-ed-primary/5' : ''"
      >
        {{ item.title }}
      </NuxtLink>

      <!-- Cấp gốc: lá -->
      <NuxtLink
        v-else-if="item.slug && !(item.children?.length) && !isNested"
        :to="`/${item.slug}`"
        class="mb-1 flex items-center gap-3 rounded-lg px-4 py-3 text-[0.875rem] leading-6 transition-all duration-300 ease-in-out"
        :class="
          isActive(item)
            ? 'bg-ed-surface-container-lowest font-bold text-ed-primary shadow-sm dark:bg-slate-700 dark:text-blue-300'
            : 'text-ed-on-surface-variant hover:bg-ed-surface-container-low hover:text-ed-on-surface dark:text-slate-400 dark:hover:bg-slate-700/50'
        "
      >
        <span class="material-symbols-ed text-[1.25rem]">{{ materialIcon(item.icon) }}</span>
        <span>{{ item.title }}</span>
      </NuxtLink>

      <!-- Nhánh có con -->
      <details
        v-else-if="item.children?.length"
        class="group/tree editorial-nav-details"
        :open="hasActiveDescendant(item)"
      >
        <summary
          class="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-4 py-3 text-ed-on-surface-variant transition-all duration-300 ease-in-out hover:bg-ed-surface-container-low hover:text-ed-on-surface dark:text-slate-400 dark:hover:bg-slate-700/50"
          :class="isNested ? 'px-3 py-2 text-[0.8125rem]' : 'text-[0.875rem] leading-6'"
        >
          <div class="flex items-center gap-3">
            <span
              v-if="!isNested"
              class="material-symbols-ed text-[1.25rem]"
            >{{ materialIcon(item.icon) }}</span>
            <span>{{ item.title }}</span>
          </div>
          <span
            class="material-symbols-ed text-sm transition-transform duration-200 group-open/tree:rotate-90"
          >chevron_right</span>
        </summary>
        <div
          class="mt-1 space-y-1 border-ed-outline-variant/30 pl-2 dark:border-slate-600/40"
          :class="isNested ? 'ml-4 border-l' : 'ml-9 border-l'"
        >
          <EditorialNavTree :items="item.children!" :depth="nextDepth" />
        </div>
      </details>

      <div
        v-else
        class="flex items-center gap-3 rounded-lg px-4 py-3 text-[0.875rem] text-ed-on-surface-variant/70 dark:text-slate-500"
      >
        <span class="material-symbols-ed text-[1.25rem]">{{ materialIcon(item.icon) }}</span>
        <span>{{ item.title }}</span>
      </div>
    </template>
  </nav>
</template>
