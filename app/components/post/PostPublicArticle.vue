<script setup lang="ts">
import { iconifyNameToUiIcon } from '~/utils/icon-name'
import { expandStandaloneVideoEmbeds } from '~/utils/rich-video-embeds'

const { t } = useI18n()

export type PostBreadcrumbCrumb = { title: string; slug?: string; icon?: string }

function crumbUiIcon (raw?: string): string {
  return iconifyNameToUiIcon(raw)
}

const props = defineProps<{
  title: string
  content: string
  createdAt?: string | Date | null
  /** Ưu tiên hiển thị trên trang công khai; thiếu thì dùng createdAt. */
  updatedAt?: string | Date | null
  prev?: { slug: string; title: string } | null
  next?: { slug: string; title: string } | null
  /** Đường dẫn menu (cùng sidebar); mục cuối hiển thị bằng `title` bài viết. */
  breadcrumbTrail?: PostBreadcrumbCrumb[] | null
}>()

const articleDate = computed(() => {
  const u = props.updatedAt
  if (u != null && u !== '') return u
  return props.createdAt ?? null
})

const contentRef = ref<HTMLElement | null>(null)
const tocItems = ref<{ id: string; title: string }[]>([])

const displayContent = computed(() => expandStandaloneVideoEmbeds(props.content))

function rebuildToc() {
  tocItems.value = []
  const el = contentRef.value
  if (!el) return
  const hs = el.querySelectorAll('h2')
  let i = 0
  hs.forEach((h) => {
    i += 1
    const he = h as HTMLElement
    if (!he.id) he.id = `doc-section-${i}`
    tocItems.value.push({
      id: he.id,
      title: h.textContent?.trim() || `§${i}`
    })
  })
}

watch(
  () => displayContent.value,
  async () => {
    await nextTick()
    rebuildToc()
  },
  { immediate: true }
)

onMounted(() => {
  nextTick(() => rebuildToc())
})
</script>

<template>
  <div
    class="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-12 sm:px-8 lg:px-12 xl:flex-row"
  >
    <article class="max-w-3xl flex-1">
      <nav
        class="mb-8 flex flex-wrap items-center gap-2 text-sm font-medium text-ed-on-surface-variant"
        :aria-label="t('editorial.breadcrumbNav')"
      >
        <template v-if="breadcrumbTrail?.length">
          <template v-for="(crumb, i) in breadcrumbTrail" :key="`${i}-${crumb.title}`">
            <span
              v-if="i > 0"
              class="material-symbols-ed text-xs"
              aria-hidden="true"
            >chevron_right</span>
            <template v-if="i < breadcrumbTrail.length - 1">
              <NuxtLink
                v-if="crumb.slug"
                class="inline-flex items-center gap-1.5 transition-colors hover:text-ed-primary dark:hover:text-blue-300"
                :to="`/${crumb.slug}`"
              >
                <UIcon :name="crumbUiIcon(crumb.icon)" class="size-4 shrink-0" />
                {{ crumb.title }}
              </NuxtLink>
              <span
                v-else
                class="inline-flex items-center gap-1.5 text-ed-on-surface-variant dark:text-slate-400"
              >
                <UIcon :name="crumbUiIcon(crumb.icon)" class="size-4 shrink-0" />
                {{ crumb.title }}
              </span>
            </template>
            <span
              v-else
              class="inline-flex items-center gap-1.5 text-ed-on-surface dark:text-slate-200"
              aria-current="page"
            >
              <UIcon :name="crumbUiIcon(crumb.icon)" class="size-4 shrink-0" />
              {{ title }}
            </span>
          </template>
        </template>
        <template v-else>
          <span class="text-ed-on-surface dark:text-slate-200" aria-current="page">{{ title }}</span>
        </template>
      </nav>

      <h1
        class="mb-2 font-ed-headline text-4xl font-extrabold tracking-tight text-ed-on-surface dark:text-slate-50 sm:text-5xl"
      >
        {{ title }}
      </h1>

      <div class="mb-8 flex flex-wrap items-center gap-3 text-sm text-ed-on-surface-variant dark:text-slate-400">
        <div
          v-if="articleDate"
          class="inline-flex items-center gap-2 rounded-lg border border-ed-outline-variant/20 bg-ed-surface-container-low/50 px-3 py-1.5 dark:border-slate-600/40 dark:bg-slate-800/50"
        >
          <span
            class="material-symbols-ed shrink-0 text-lg text-ed-primary dark:text-blue-400"
            aria-hidden="true"
          >edit</span>
          <time
            class="font-medium text-ed-on-surface dark:text-slate-300"
            :datetime="new Date(articleDate).toISOString()"
          >
            {{ t('post.lastUpdated') }}:
            {{ new Date(articleDate).toLocaleDateString() }}
          </time>
        </div>
      </div>

      <div
        ref="contentRef"
        class="post-richtext leading-relaxed text-ed-on-surface dark:text-slate-200"
        v-html="displayContent"
      />

      <nav
        v-if="prev || next"
        class="mt-12 grid gap-4 border-t border-ed-outline-variant/30 pt-10 sm:grid-cols-2 dark:border-slate-700"
      >
        <NuxtLink
          v-if="prev"
          :to="`/${prev.slug}`"
          class="group flex flex-col gap-1 rounded-xl border border-ed-outline-variant/25 bg-ed-surface-container-low/40 p-4 transition-colors hover:border-ed-primary/40 hover:bg-ed-surface-container-low dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-blue-500/40"
        >
          <span class="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-ed-on-surface-variant dark:text-slate-500">
            <span class="material-symbols-ed text-sm">arrow_back</span>
            {{ t('post.navPrevious') }}
          </span>
          <span class="font-ed-headline text-base font-semibold text-ed-on-surface group-hover:text-ed-primary dark:text-slate-100 dark:group-hover:text-blue-300">
            {{ prev.title }}
          </span>
        </NuxtLink>
        <div v-else class="hidden sm:block" />

        <NuxtLink
          v-if="next"
          :to="`/${next.slug}`"
          class="group flex flex-col items-end gap-1 rounded-xl border border-ed-outline-variant/25 bg-ed-surface-container-low/40 p-4 text-right transition-colors hover:border-ed-primary/40 hover:bg-ed-surface-container-low dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-blue-500/40 sm:col-start-2"
        >
          <span class="flex flex-row-reverse items-center gap-1 text-xs font-bold uppercase tracking-wider text-ed-on-surface-variant dark:text-slate-500">
            <span class="material-symbols-ed text-sm">arrow_forward</span>
            {{ t('post.navNext') }}
          </span>
          <span class="font-ed-headline text-base font-semibold text-ed-on-surface group-hover:text-ed-primary dark:text-slate-100 dark:group-hover:text-blue-300">
            {{ next.title }}
          </span>
        </NuxtLink>
      </nav>
    </article>

    <aside v-if="tocItems.length" class="hidden w-64 shrink-0 self-start xl:block">
      <div class="sticky top-32 rounded-xl p-2">
        <h4
          class="mb-6 flex items-center gap-2 text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-ed-on-surface-variant/60 dark:text-slate-500"
        >
          <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-ed-primary" />
          {{ t('editorial.onThisPage') }}
        </h4>
        <ul class="space-y-1 border-l border-ed-outline-variant/20 text-[0.875rem] dark:border-slate-600">
          <li v-for="item in tocItems" :key="item.id">
            <a
              class="-ml-[1.5px] flex items-center gap-3 rounded-r-lg border-l-2 border-transparent py-2 pl-4 pr-2 text-ed-on-surface-variant transition-all duration-200 hover:bg-ed-surface-container-low hover:text-ed-on-surface dark:hover:bg-slate-800"
              :href="`#${item.id}`"
            >
              {{ item.title }}
            </a>
          </li>
        </ul>
      </div>
    </aside>
  </div>
</template>
