<script setup lang="ts">
const { isOpen, seedQuery, open, close } = useSearchModal()

const localQ = ref('')
const results = ref<Array<{ id: string; title: string; snippet: string }>>([])
const pending = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const inputRef = ref<HTMLInputElement | null>(null)

watch(isOpen, (openNow) => {
  if (import.meta.client) {
    document.documentElement.classList.toggle('overflow-hidden', openNow)
  }
  if (openNow) {
    localQ.value = seedQuery.value
    nextTick(() => {
      inputRef.value?.focus()
      void runSearch(localQ.value)
    })
  }
  else {
    results.value = []
    pending.value = false
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }
})

async function runSearch(q: string) {
  const t = q.trim()
  if (t.length < 2) {
    results.value = []
    pending.value = false
    return
  }
  pending.value = true
  try {
    results.value = await $fetch<Array<{ id: string; title: string; snippet: string }>>(
      '/api/search',
      { query: { q: t } },
    )
  }
  catch {
    results.value = []
  }
  finally {
    pending.value = false
  }
}

watch(localQ, (q) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    void runSearch(q)
  }, 280)
})

function onOverlayClick(e: MouseEvent) {
  if ((e.target as HTMLElement).dataset.overlay === 'true') {
    close()
  }
}

function onSelectResult() {
  close()
}

function onGlobalKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    if (isOpen.value) {
      close()
    }
    else {
      open('')
    }
    return
  }
  if (e.key === 'Escape' && isOpen.value) {
    e.preventDefault()
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
  if (import.meta.client) {
    document.documentElement.classList.remove('overflow-hidden')
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-on-surface/40 p-4 pt-[min(12vh,6rem)] backdrop-blur-sm sm:p-6 dark:bg-slate-950/50"
        data-overlay="true"
        role="presentation"
        @click="onOverlayClick"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="translate-y-2 scale-[0.98] opacity-0"
          enter-to-class="translate-y-0 scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 scale-100 opacity-100"
          leave-to-class="translate-y-2 scale-[0.98] opacity-0"
        >
          <div
            v-if="isOpen"
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-modal-title"
            class="relative w-full max-w-xl rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-lg shadow-primary/10 dark:border-slate-700 dark:bg-slate-900"
            @click.stop
          >
            <div class="flex items-center gap-3 border-b border-outline-variant/20 px-4 py-3 sm:px-5 dark:border-slate-700">
              <span class="material-symbols-outlined shrink-0 text-primary">search</span>
              <div class="min-w-0 flex-1">
                <h2
                  id="search-modal-title"
                  class="text-sm font-bold text-on-surface dark:text-slate-100"
                >
                  Tìm trong site
                </h2>
                <p class="text-xs text-on-surface-variant">
                  Tối thiểu 2 ký tự ·
                  <kbd class="rounded border border-outline-variant/20 bg-surface-container-high px-1 font-mono text-[10px] text-on-surface-variant">⌘K</kbd>
                  /
                  <kbd class="rounded border border-outline-variant/20 bg-surface-container-high px-1 font-mono text-[10px] text-on-surface-variant">Ctrl+K</kbd>
                </p>
              </div>
              <button
                type="button"
                class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface dark:hover:bg-slate-800"
                aria-label="Đóng"
                @click="close"
              >
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div class="p-4 sm:p-5">
              <input
                ref="inputRef"
                v-model="localQ"
                type="search"
                class="w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-base text-on-surface transition-all placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500/25"
                placeholder="Tìm theo tiêu đề hoặc nội dung…"
                autocomplete="off"
              >

              <p
                v-if="localQ.trim().length > 0 && localQ.trim().length < 2"
                class="mt-3 text-sm text-on-surface-variant"
              >
                Nhập thêm ít nhất một ký tự nữa.
              </p>
              <p
                v-else-if="pending"
                class="mt-3 text-sm text-on-surface-variant"
              >
                Đang tìm…
              </p>
              <p
                v-else-if="localQ.trim().length >= 2 && results.length === 0"
                class="mt-3 text-sm text-on-surface-variant"
              >
                Không có kết quả.
              </p>

              <ul
                v-if="results.length"
                class="mt-4 max-h-[min(50vh,22rem)] divide-y divide-outline-variant/20 overflow-y-auto rounded-xl border border-outline-variant/20 dark:divide-slate-700 dark:border-slate-700"
              >
                <li
                  v-for="r in results"
                  :key="r.id"
                >
                  <NuxtLink
                    :to="r.id"
                    class="block px-4 py-3 transition-colors hover:bg-primary/5 dark:hover:bg-slate-800"
                    @click="onSelectResult"
                  >
                    <span class="font-semibold text-primary dark:text-blue-300">{{ r.title }}</span>
                    <p
                      v-if="r.snippet"
                      class="mt-0.5 line-clamp-2 text-sm text-on-surface-variant"
                    >
                      {{ r.snippet }}
                    </p>
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
