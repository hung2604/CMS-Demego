<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

defineProps<{
  navigation: ContentNavigationItem[]
}>()

const { navDrawerOpen, closeNavDrawer } = useEditorialShell()

function onNavigate() {
  if (import.meta.client && window.matchMedia('(max-width: 1023px)').matches) {
    closeNavDrawer()
  }
}
</script>

<template>
  <div>
    <!-- Overlay mobile -->
    <div
      v-show="navDrawerOpen"
      class="fixed inset-0 z-[90] bg-on-surface/30 backdrop-blur-sm lg:hidden"
      aria-hidden="true"
      @click="closeNavDrawer"
    />

    <aside
      class="fixed left-0 top-0 z-[95] flex h-screen w-72 flex-col gap-1 border-r border-outline-variant/10 bg-surface-container px-4 pt-20 transition-transform duration-300 ease-out dark:bg-slate-800 max-lg:-translate-x-full lg:translate-x-0"
      :class="{ 'max-lg:translate-x-0': navDrawerOpen }"
      aria-label="Điều hướng tài liệu"
    >
      <div class="px-4 py-6">
        <h3 class="font-headline text-lg font-bold text-on-surface dark:text-slate-200">
          Tài liệu
        </h3>
      </div>
      <nav
        class="min-h-0 flex-1 space-y-1 overflow-y-auto pb-8"
        aria-label="Tất cả trang"
        @click="onNavigate"
      >
        <SiteNavTree :items="navigation" />
      </nav>
    </aside>
  </div>
</template>
