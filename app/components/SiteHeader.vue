<script setup lang="ts">
const { open } = useSearchModal()
const { toggleNavDrawer, toggleDark } = useEditorialShell()

const headerQ = ref('')

function onSearchEnter() {
  const q = headerQ.value.trim()
  open(q)
  headerQ.value = ''
}

function onSearchSubmit(e: Event) {
  e.preventDefault()
  onSearchEnter()
}
</script>

<template>
  <header
    class="fixed top-0 z-[100] flex w-full max-w-none items-center justify-between border-b border-outline-variant/10 bg-[#f7f9fb] px-4 py-4 dark:bg-slate-900 sm:px-8"
  >
    <div class="flex items-center gap-4 sm:gap-6">
      <button
        type="button"
        class="text-primary active:scale-95 active:opacity-80 transition-all lg:hidden dark:text-blue-400"
        aria-label="Mở menu"
        @click="toggleNavDrawer"
      >
        <span class="material-symbols-outlined text-3xl">menu_open</span>
      </button>
      <NuxtLink
        to="/"
        class="flex shrink-0 items-center outline-none ring-primary/30 transition-opacity hover:opacity-90 focus-visible:rounded-md focus-visible:ring-2"
      >
        <img
          src="/than-nong-01.png"
          alt="CMS Demego"
          class="h-9 w-auto max-h-10 max-w-[min(100%,12rem)] object-contain object-left sm:h-10"
          decoding="async"
        >
      </NuxtLink>
    </div>

    <div class="mx-4 hidden max-w-xl flex-1 md:flex lg:mx-12">
      <form
        class="group relative w-full"
        role="search"
        @submit="onSearchSubmit"
      >
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <span class="material-symbols-outlined text-sm text-on-surface-variant dark:text-slate-500">search</span>
        </div>
        <input
          v-model="headerQ"
          type="search"
          class="w-full rounded-full border border-transparent bg-surface-container-low py-2.5 pl-11 pr-4 text-sm text-on-surface transition-all placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-primary/20 dark:border-slate-700/80 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:ring-blue-500/25"
          placeholder="Tìm trong site…"
          autocomplete="off"
          @keydown.enter.prevent="onSearchEnter"
        >
        <div class="absolute inset-y-0 right-3 flex items-center">
          <kbd class="hidden rounded border border-outline-variant/20 bg-surface-container-high px-2 py-1 text-[10px] font-semibold uppercase text-on-surface-variant sm:inline-block dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-400">
            Ctrl K
          </kbd>
        </div>
      </form>
    </div>

    <div class="flex shrink-0 items-center gap-2 sm:gap-4">
      <button
        type="button"
        class="rounded-full p-2 text-on-surface transition-colors duration-200 hover:bg-surface-container-high md:hidden dark:hover:bg-slate-800"
        aria-label="Tìm kiếm"
        @click="open('')"
      >
        <span class="material-symbols-outlined">search</span>
      </button>
      <button
        type="button"
        class="rounded-full p-2 transition-colors duration-200 hover:bg-surface-container-high dark:hover:bg-slate-800"
        aria-label="Chế độ tối"
        @click="toggleDark"
      >
        <span class="material-symbols-outlined text-on-surface dark:text-slate-200">dark_mode</span>
      </button>
      <NuxtLink
        to="/"
        class="hidden rounded-full bg-gradient-to-r from-primary to-primary-container px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/10 transition-all hover:opacity-90 active:scale-95 sm:inline-block"
      >
        Trang chủ
      </NuxtLink>
    </div>
  </header>
</template>
