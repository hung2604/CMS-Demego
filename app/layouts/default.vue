<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findActiveRoot } from '~/utils/navigation'

const { data: navigation } = await useAsyncData('layout-navigation', () =>
  queryCollectionNavigation('content'),
)

const route = useRoute()

const nav = computed(() => navigation.value ?? [])

const activeRoot = computed<ContentNavigationItem | null>(() =>
  findActiveRoot(nav.value, route.path),
)

const submenuItems = computed(
  () => activeRoot.value?.children?.filter(Boolean) ?? [],
)
</script>

<template>
  <div
    class="min-h-dvh bg-surface font-sans text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container dark:bg-slate-950 dark:text-slate-100"
  >
    <SiteHeader />
    <SearchModal />

    <!--
      Sidebar là fixed → wrapper không có chiều cao; phải cho main min-height theo viewport
      (trừ vùng pt-20 = header) + flex column để footer dính đáy khi nội dung ngắn.
    -->
    <div class="flex pt-20">
      <SiteSidebar :navigation="nav" />

      <main
        class="flex min-h-[calc(100dvh-5rem)] min-w-0 flex-1 flex-col bg-surface lg:ml-72 dark:bg-slate-900"
      >
        <div
          class="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-12 px-4 py-12 sm:px-8 lg:px-12 xl:flex-row"
        >
          <div class="order-1 min-w-0 max-w-3xl flex-1 xl:order-1">
            <slot />
          </div>

          <SiteSubmenu
            :active-root="activeRoot"
            :items="submenuItems"
            class="order-2 shrink-0 xl:order-2 xl:w-64"
          />
        </div>

        <SiteFooter class="mt-auto" />
      </main>
    </div>
  </div>
</template>
