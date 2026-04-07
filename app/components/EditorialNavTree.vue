<script setup lang="ts">
import { iconifyNameToUiIcon } from '~/utils/icon-name'
import { normalizeMenuDocId } from '~/utils/menu-tree'

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
    /** Mục menu (Mongo _id) gắn với bài đang xem — mở nhánh & active khi slug route lệch. */
    activeMenuId?: string | null
  }>(),
  { depth: 0, activeMenuId: null }
)

const route = useRoute()

/** Cùng quy ước tên icon với admin (Nuxt Icon / UIcon). */
function navUiIcon(raw?: string): string {
  return iconifyNameToUiIcon(raw)
}

function menuItemId (item: EditorialNavItem): string {
  return normalizeMenuDocId(item._id)
}

function isActive (item: EditorialNavItem): boolean {
  const mid = props.activeMenuId
  if (mid && menuItemId(item) === normalizeMenuDocId(mid)) return true
  if (!item.slug) return false
  const p = `/${item.slug}`
  const path = route.path.length > 1 ? route.path.replace(/\/$/, '') : route.path
  return path === p || path.startsWith(`${p}/`)
}

function hasActiveDescendant(item: EditorialNavItem): boolean {
  if (isActive(item)) return true
  return item.children?.some(hasActiveDescendant) ?? false
}

/** Mục cha: cùng kiểu highlight với lá khi con (hoặc chính nó) đang xem. */
function summaryNavClass (item: EditorialNavItem): string {
  const nested = props.depth > 0
  const size = nested
    ? 'px-3 py-2 text-[0.8125rem]'
    : 'px-4 py-3 text-[0.875rem] leading-6'
  const layout =
    'flex cursor-pointer items-center justify-between gap-3 rounded-lg transition-all duration-300 ease-in-out'
  if (hasActiveDescendant(item)) {
    const active = nested
      ? '!text-ed-primary !font-semibold bg-ed-primary/5 dark:text-blue-300'
      : 'bg-ed-surface-container-lowest font-bold text-ed-primary shadow-sm dark:bg-slate-700 dark:text-blue-300'
    return `${layout} ${size} ${active}`
  }
  return `${layout} ${size} text-ed-on-surface-variant hover:bg-ed-surface-container-low hover:text-ed-on-surface dark:text-slate-400 dark:hover:bg-slate-700/50`
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
        <UIcon :name="navUiIcon(item.icon)" class="size-5 shrink-0" />
        <span>{{ item.title }}</span>
      </NuxtLink>

      <!-- Nhánh có con -->
      <details
        v-else-if="item.children?.length"
        class="group/tree editorial-nav-details"
        :open="hasActiveDescendant(item)"
      >
        <summary
          :class="summaryNavClass(item)"
        >
          <div class="flex items-center gap-3">
            <UIcon
              v-if="!isNested"
              :name="navUiIcon(item.icon)"
              class="size-5 shrink-0"
            />
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
          <EditorialNavTree
            :items="item.children!"
            :depth="nextDepth"
            :active-menu-id="activeMenuId"
          />
        </div>
      </details>

      <div
        v-else
        class="flex items-center gap-3 rounded-lg px-4 py-3 text-[0.875rem] text-ed-on-surface-variant/70 dark:text-slate-500"
      >
        <UIcon :name="navUiIcon(item.icon)" class="size-5 shrink-0" />
        <span>{{ item.title }}</span>
      </div>
    </template>
  </nav>
</template>
