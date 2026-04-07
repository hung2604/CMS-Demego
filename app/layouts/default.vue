<script setup lang="ts">
const { t, locale } = useI18n()
const route = useRoute()
const menuLoc = computed(() => (locale.value === 'en' ? 'en' : 'vi') as const)

const colorMode = useColorMode()

const { siteName, footerText, socialLinkItems } = useSettings()
const { data: menus } = await useFetch<Record<string, unknown>[]>('/api/menus', {
  key: 'menus',
  default: () => [],
  transform: (payload) => (Array.isArray(payload) ? payload : [])
})

const searchOpen = ref(false)
const mobileNavOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    mobileNavOpen.value = false
  }
)

const menuTree = computed(() => buildMenuTree(menus.value, false, menuLoc.value))

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

watch(mobileNavOpen, open => {
  if (import.meta.client) {
    document.body.style.overflow = open ? 'hidden' : ''
  }
})

onUnmounted(() => {
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <div
    class="editorial-site min-h-dvh bg-ed-surface font-ed-body text-ed-on-surface selection:bg-ed-primary-container selection:text-ed-on-primary-container dark:bg-slate-900 dark:text-slate-100"
  >
    <UserSiteSearch v-model:open="searchOpen" />

    <!-- TopAppBar -->
    <header
      class="fixed top-0 z-50 flex w-full max-w-none items-center justify-between border-b border-ed-outline-variant/10 bg-ed-surface px-4 py-4 sm:px-8 dark:border-slate-700 dark:bg-slate-900"
    >
      <div class="flex items-center gap-4 lg:gap-6">
        <button
          type="button"
          class="active:scale-95 lg:hidden"
          :aria-label="t('editorial.openMenu')"
          @click="mobileNavOpen = true"
        >
          <span class="material-symbols-ed text-3xl text-ed-primary dark:text-blue-400">menu_open</span>
        </button>
        <NuxtLink
          to="/"
          class="flex items-center gap-2 truncate font-ed-headline text-xl font-extrabold tracking-tighter text-ed-on-surface dark:text-slate-100 sm:text-2xl"
        >
          <SharedLogo class="h-8 w-auto shrink-0" />
          <span class="truncate">{{ siteName }}</span>
        </NuxtLink>
      </div>

      <div class="mx-4 hidden max-w-xl flex-1 md:flex">
        <div class="relative w-full">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <span class="material-symbols-ed text-sm text-ed-on-surface-variant">search</span>
          </div>
          <button
            type="button"
            class="w-full rounded-[9999px] bg-ed-surface-container-low py-2.5 pl-11 pr-4 text-left text-sm text-ed-on-surface-variant transition-all hover:ring-2 hover:ring-ed-primary/20 focus:outline-none focus:ring-2 focus:ring-ed-primary/20 dark:bg-slate-800 dark:text-slate-400"
            @click="searchOpen = true"
          >
            {{ t('editorial.searchShortPlaceholder') }}
          </button>
          <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <kbd
              class="hidden rounded border border-ed-outline-variant/20 bg-ed-surface-container-high px-2 py-1 text-[10px] font-semibold uppercase text-ed-on-surface-variant sm:inline-block"
            >
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-2 sm:gap-4">
        <button
          type="button"
          class="md:hidden rounded-full p-2 transition-colors hover:bg-ed-surface-container-high dark:hover:bg-slate-800"
          :aria-label="t('search.open')"
          @click="searchOpen = true"
        >
          <span class="material-symbols-ed text-ed-on-surface-variant dark:text-slate-300">search</span>
        </button>
        <UserEditorialLocaleSwitch />
        <button
          type="button"
          class="rounded-full p-2 transition-colors duration-200 hover:bg-ed-surface-container-high dark:hover:bg-slate-800"
          :aria-label="t('editorial.toggleTheme')"
          @click="toggleColorMode"
        >
          <span
            v-if="colorMode.value === 'dark'"
            class="material-symbols-ed text-ed-on-surface dark:text-slate-200"
          >light_mode</span>
          <span v-else class="material-symbols-ed text-ed-on-surface-variant">dark_mode</span>
        </button>
      </div>
    </header>

    <!-- Mobile drawer backdrop -->
    <div
      v-show="mobileNavOpen"
      class="fixed inset-0 z-40 bg-ed-on-surface/25 backdrop-blur-sm lg:hidden"
      aria-hidden="true"
      @click="mobileNavOpen = false"
    />

    <div class="flex min-h-screen pt-20">
      <!-- Sidebar desktop (cột 1 — nền surface-container) -->
      <aside
        class="fixed left-0 top-0 z-30 hidden h-screen w-72 shrink-0 overflow-hidden border-r border-ed-outline-variant/10 bg-ed-surface-container px-4 pt-20 dark:border-slate-700 dark:bg-slate-800 lg:flex lg:flex-col"
      >
        <div class="shrink-0 px-4 py-6">
          <h3 class="font-ed-headline text-lg font-bold text-ed-on-surface dark:text-slate-200">
            {{ t('sidebar.title') }}
          </h3>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto pb-6">
          <EditorialNavTree v-if="menuTree.length" :items="menuTree" />
          <p v-else class="px-4 text-sm text-ed-on-surface-variant dark:text-slate-400">
            {{ t('sidebar.noItems') }}
          </p>
        </div>
      </aside>

      <!-- Sidebar mobile -->
      <aside
        class="fixed left-0 top-0 z-50 flex h-full w-72 max-w-[85vw] flex-col overflow-hidden border-r border-ed-outline-variant/10 bg-ed-surface-container px-4 pt-20 shadow-[0_12px_32px_rgba(25,28,30,0.06)] transition-transform duration-300 ease-out dark:border-slate-700 dark:bg-slate-800 lg:hidden"
        :class="mobileNavOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <div class="flex shrink-0 items-center justify-between px-2 py-2">
          <h3 class="font-ed-headline text-lg font-bold text-ed-on-surface dark:text-slate-200">
            {{ t('sidebar.title') }}
          </h3>
          <button
            type="button"
            class="rounded-full p-2 hover:bg-ed-surface-container-high dark:hover:bg-slate-700"
            :aria-label="t('editorial.closeMenu')"
            @click="mobileNavOpen = false"
          >
            <span class="material-symbols-ed">close</span>
          </button>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto">
          <EditorialNavTree v-if="menuTree.length" :items="menuTree" />
          <p v-else class="px-4 text-sm text-ed-on-surface-variant">
            {{ t('sidebar.noItems') }}
          </p>
        </div>
      </aside>

      <!-- Main canvas (cột 2 + optional TOC do trang con đặt slot) -->
      <main class="min-h-screen flex-1 bg-ed-surface lg:ml-72 dark:bg-slate-900">
        <slot />
      </main>
    </div>

    <!-- Footer -->
    <footer
      class="border-t border-ed-outline-variant/15 bg-ed-surface py-12 dark:border-slate-800 dark:bg-slate-900 lg:ml-72"
    >
      <div class="flex flex-col items-center gap-4 px-4">
        <div class="mb-2 flex flex-wrap justify-center gap-6 sm:gap-8">
          <a
            v-for="s in socialLinkItems"
            :key="s.key"
            class="font-ed-body text-xs text-ed-on-surface-variant underline decoration-ed-primary/40 underline-offset-4 transition-colors hover:text-ed-on-surface dark:text-slate-500 dark:hover:text-slate-300"
            :href="s.url"
            target="_blank"
            rel="noopener noreferrer"
          >{{ s.label }}</a>
        </div>
        <p class="text-center font-ed-body text-xs text-ed-on-surface-variant dark:text-slate-500">
          {{ t('footer.copyright', { year: new Date().getFullYear(), siteName }) }}
        </p>
        <p
          v-if="footerText"
          class="max-w-prose text-center text-xs text-ed-on-surface-variant/90 dark:text-slate-500"
        >
          {{ footerText }}
        </p>
      </div>
    </footer>
  </div>
</template>
