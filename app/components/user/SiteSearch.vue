<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'

const open = defineModel<boolean>('open', { required: true })

const { t, locale } = useI18n()
const { siteName } = useSettings()

type SearchPayload = {
  menus: { id: string; label: string; to: string }[]
  posts: { id: string; label: string; description?: string; to: string }[]
}

const query = ref('')
const result = ref<SearchPayload | null>(null)
const loading = ref(false)
const fetchError = ref(false)

let abortCtrl: AbortController | null = null

async function runSearch (q: string) {
  abortCtrl?.abort()
  abortCtrl = new AbortController()
  loading.value = true
  fetchError.value = false
  try {
    result.value = await $fetch<SearchPayload>('/api/search', {
      query: { q, locale: locale.value },
      signal: abortCtrl.signal
    })
  } catch (e: unknown) {
    if ((e as Error)?.name === 'AbortError') return
    fetchError.value = true
    result.value = null
  } finally {
    loading.value = false
  }
}

watchDebounced(
  [query, open, locale],
  () => {
    if (!open.value) return
    const q = query.value.trim()
    if (!q) {
      result.value = null
      loading.value = false
      fetchError.value = false
      return
    }
    runSearch(q)
  },
  { debounce: 280 }
)

watch(open, (v) => {
  if (v) {
    query.value = ''
    result.value = null
    fetchError.value = false
    nextTick(() => inputRef.value?.focus())
  } else {
    abortCtrl?.abort()
    abortCtrl = null
  }
})

const inputRef = ref<HTMLInputElement | null>(null)

const groups = computed(() => {
  const r = result.value
  if (!r) return [] as { id: string; label: string; items: { id: string; label: string; to: string; description?: string }[] }[]
  const out: { id: string; label: string; items: { id: string; label: string; to: string; description?: string }[] }[] = []
  if (r.menus?.length) {
    out.push({ id: 'menus', label: t('search.groupMenus'), items: r.menus })
  }
  if (r.posts?.length) {
    out.push({ id: 'posts', label: t('search.groupPosts'), items: r.posts })
  }
  return out
})

const hasQuery = computed(() => query.value.trim().length > 0)

const showNoHits = computed(
  () => hasQuery.value && !loading.value && !fetchError.value && groups.value.length === 0
)

function clearQuery () {
  query.value = ''
  result.value = null
  fetchError.value = false
  nextTick(() => inputRef.value?.focus())
}

function close () {
  open.value = false
}

function onKeydown (e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
  abortCtrl?.abort()
})

function onGlobalKeydown (e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    open.value = !open.value
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-ed-on-surface/20 p-4 backdrop-blur-sm md:p-6"
      role="dialog"
      aria-modal="true"
      :aria-label="t('search.open')"
      @click.self="close"
    >
      <div
        class="editorial-glass flex max-h-[min(870px,90vh)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-ed-outline-variant/10 shadow-[0_12px_32px_rgba(25,28,30,0.06)]"
        @keydown="onKeydown"
      >
        <div class="flex items-center gap-3 border-b border-ed-outline-variant/10 p-6 pb-4 sm:gap-4">
          <span class="material-symbols-ed shrink-0 text-2xl text-ed-primary">search</span>
          <div
            class="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-ed-outline-variant/20 bg-ed-surface-container-low/55 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-[box-shadow,border-color] focus-within:border-ed-outline-variant/35 focus-within:shadow-[inset_0_0_0_1px_rgba(0,58,160,0.06),inset_0_1px_0_rgba(255,255,255,0.4)] dark:border-slate-600/40 dark:bg-slate-800/55 dark:shadow-none dark:focus-within:border-slate-500/55 dark:focus-within:shadow-[inset_0_0_0_1px_rgba(96,165,250,0.12)]"
          >
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              inputmode="search"
              enterkeyhint="search"
              class="font-ed-headline min-w-0 flex-1 border-0 bg-transparent text-xl font-semibold text-ed-on-surface outline-none ring-0 placeholder:text-ed-on-surface-variant/50 focus:border-0 focus:outline-none focus:ring-0 dark:text-slate-100"
              :placeholder="t('editorial.searchPlaceholder')"
              autocomplete="off"
              aria-autocomplete="list"
            >
            <button
              v-if="hasQuery"
              type="button"
              class="flex shrink-0 rounded-md p-1 text-ed-on-surface-variant transition-colors hover:bg-ed-surface-container-high hover:text-ed-on-surface dark:hover:bg-slate-700"
              :aria-label="t('editorial.clearSearch')"
              @click="clearQuery"
            >
              <span class="material-symbols-ed text-xl leading-none">close</span>
            </button>
          </div>
          <kbd
            class="hidden shrink-0 rounded-lg border border-ed-outline-variant/20 bg-ed-surface-container-high px-2 py-1 text-[10px] font-bold tracking-widest text-ed-on-surface-variant sm:inline-block"
          >
            ESC
          </kbd>
        </div>

        <div class="custom-scrollbar min-h-[12rem] flex-1 space-y-10 overflow-y-auto p-6">
          <p
            v-if="!hasQuery"
            class="text-center text-sm leading-relaxed text-ed-on-surface-variant dark:text-slate-400"
          >
            {{ t('editorial.searchTypeHint') }}
          </p>
          <p
            v-else-if="loading"
            class="text-center text-sm text-ed-on-surface-variant dark:text-slate-400"
          >
            {{ t('editorial.searchLoading') }}
          </p>
          <p
            v-else-if="fetchError"
            class="text-center text-sm text-ed-error dark:text-red-300"
          >
            {{ t('editorial.searchError') }}
          </p>
          <p
            v-else-if="showNoHits"
            class="text-center text-sm text-ed-on-surface-variant dark:text-slate-400"
          >
            {{ t('editorial.searchEmpty') }}
          </p>

          <template v-else>
            <section v-for="g in groups" :key="g.id">
              <h3
                class="mb-5 flex items-center gap-2 font-ed-headline text-sm font-bold uppercase tracking-widest text-ed-on-surface-variant/70"
              >
                <span class="h-4 w-1 rounded-full bg-ed-primary" />
                {{ g.label }}
              </h3>
              <div class="space-y-1">
                <NuxtLink
                  v-for="item in g.items"
                  :key="item.id"
                  :to="item.to"
                  class="group flex items-center justify-between rounded-xl px-4 py-3 transition-all hover:bg-ed-surface-container-high dark:hover:bg-slate-800"
                  @click="close"
                >
                  <div class="min-w-0 flex-1">
                    <p
                      class="truncate font-medium text-ed-on-surface group-hover:text-ed-primary dark:text-slate-100"
                    >
                      {{ item.label }}
                    </p>
                    <p
                      v-if="item.description"
                      class="mt-0.5 truncate text-xs text-ed-on-surface-variant"
                    >
                      {{ item.description }}
                    </p>
                  </div>
                  <span
                    class="material-symbols-ed text-ed-outline opacity-0 transition-opacity group-hover:opacity-100"
                  >north_west</span>
                </NuxtLink>
              </div>
            </section>
          </template>
        </div>

        <div
          class="flex items-center justify-between border-t border-ed-outline-variant/10 bg-ed-surface-container px-6 py-3 dark:bg-slate-800/90"
        >
          <div class="flex flex-wrap items-center gap-4 sm:gap-6">
            <div class="flex items-center gap-2 text-[11px] font-semibold text-ed-on-secondary-container">
              <span
                class="flex items-center justify-center gap-0.5 rounded border border-ed-outline-variant/20 bg-ed-surface-container-lowest px-1.5 py-0.5 shadow-sm dark:bg-slate-900/40"
              >
                <span class="material-symbols-ed" style="font-size: 14px">arrow_upward</span>
                <span class="material-symbols-ed" style="font-size: 14px">arrow_downward</span>
              </span>
              <span>{{ t('editorial.searchHintNav') }}</span>
            </div>
            <div class="flex items-center gap-2 text-[11px] font-semibold text-ed-on-secondary-container">
              <span
                class="rounded border border-ed-outline-variant/20 bg-ed-surface-container-lowest px-1.5 py-0.5 shadow-sm dark:bg-slate-900/40"
              >{{ t('editorial.searchHintEnter') }}</span>
              <span>{{ t('editorial.searchHintSelect') }}</span>
            </div>
            <div class="flex items-center gap-2 text-[11px] font-semibold text-ed-on-secondary-container">
              <span
                class="rounded border border-ed-outline-variant/20 bg-ed-surface-container-lowest px-1.5 py-0.5 shadow-sm dark:bg-slate-900/40"
              >ESC</span>
              <span>{{ t('editorial.searchHintClose') }}</span>
            </div>
          </div>
          <span class="hidden max-w-[12rem] truncate font-ed-headline text-xs font-bold italic tracking-tighter text-ed-primary/40 sm:inline dark:text-blue-300/50">
            {{ siteName }}
          </span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
