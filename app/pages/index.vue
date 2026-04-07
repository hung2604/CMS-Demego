<script setup lang="ts">
const { t, locale } = useI18n()

const { siteName, siteDescription } = useSettings()

useSeoMeta({
  title: t('nav.home'),
  description: computed(() => siteDescription.value || t('app.description'))
})

const { data: menus, status } = await useFetch<Record<string, unknown>[]>('/api/menus', {
  key: 'menus',
  default: () => [],
  transform: (payload) => (Array.isArray(payload) ? payload : [])
})
const { data: recentPosts } = await useFetch('/api/posts', {
  query: { limit: 6, status: 'published' }
})

const lang = computed(() => (locale.value === 'en' ? 'en' : 'vi'))

function locString(val: unknown, l: string) {
  if (val == null) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object' && 'vi' in (val as object)) {
    const o = val as Record<string, string>
    return o[l] ?? o.vi ?? ''
  }
  return ''
}

const menuTree = computed(() => buildMenuTree(menus.value, false, lang.value))

const firstSectionId = 'noi-dung'
</script>

<template>
  <div class="mx-auto max-w-7xl flex flex-col gap-12 px-4 py-12 sm:px-8 lg:px-12">
    <!-- Hero kiểu tài liệu (Manrope + nền surface) -->
    <header class="max-w-3xl">
      <p
        class="mb-3 font-ed-headline text-sm font-bold uppercase tracking-widest text-ed-on-surface-variant/70"
      >
        {{ t('home.heroHeadline') }}
      </p>
      <h1
        class="mb-4 font-ed-headline text-4xl font-extrabold tracking-tight text-ed-on-surface dark:text-slate-50 sm:text-5xl"
      >
        {{ siteName }}
      </h1>
      <p class="mb-8 text-lg leading-relaxed text-ed-on-surface-variant dark:text-slate-400">
        {{ siteDescription || t('app.description') }}
      </p>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <NuxtLink
          v-if="menuTree[0]?.slug"
          :to="`/${menuTree[0].slug}`"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ed-primary to-ed-primary-container px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-ed-primary/10 transition-all hover:opacity-90 active:scale-95"
        >
          {{ menuTree[0].title }}
          <span class="material-symbols-ed text-lg">arrow_forward</span>
        </NuxtLink>
        <a
          :href="`#${firstSectionId}`"
          class="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-ed-primary ring-1 ring-ed-outline-variant/25 transition-colors hover:bg-ed-surface-container-low dark:text-blue-300 dark:ring-slate-600"
        >
          {{ t('home.scrollToContent') }}
          <span class="material-symbols-ed text-lg">expand_more</span>
        </a>
      </div>
    </header>

    <div :id="firstSectionId" class="scroll-mt-28 space-y-16 md:scroll-mt-32 md:space-y-24">
      <section v-if="menuTree.length">
        <div class="mb-6 max-w-3xl">
          <p
            class="mb-2 font-ed-headline text-sm font-bold uppercase tracking-widest text-ed-on-surface-variant/70"
          >
            {{ t('home.sectionNav') }}
          </p>
          <h2 class="font-ed-headline text-2xl font-bold text-ed-primary dark:text-blue-300">
            {{ t('sidebar.title') }}
          </h2>
          <p class="mt-2 text-ed-on-surface-variant dark:text-slate-400">
            {{ t('home.sectionNavDesc') }}
          </p>
        </div>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="menu in menuTree"
            :key="menu._id"
            class="group flex flex-col rounded-xl border border-ed-outline-variant/10 bg-ed-surface-container-lowest p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80"
          >
            <div class="mb-4 flex items-start justify-between gap-2">
              <span class="material-symbols-ed text-2xl text-ed-primary">menu_book</span>
              <NuxtLink
                v-if="menu.slug"
                :to="`/${menu.slug}`"
                class="font-ed-headline text-lg font-bold text-ed-on-surface transition-colors group-hover:text-ed-primary dark:text-slate-100"
              >
                {{ menu.title }}
              </NuxtLink>
              <span
                v-else
                class="font-ed-headline text-lg font-bold text-ed-on-surface dark:text-slate-100"
              >{{ menu.title }}</span>
            </div>
            <p
              v-if="menu.children?.length"
              class="mb-4 text-sm text-ed-on-surface-variant dark:text-slate-400"
            >
              {{ t('home.childPagesCount', { count: menu.children.length }) }}
            </p>
            <ul
              v-if="menu.children?.length"
              class="mt-auto space-y-1.5 border-t border-ed-outline-variant/15 pt-4 dark:border-slate-600"
            >
              <li v-for="child in menu.children" :key="child._id">
                <NuxtLink
                  v-if="child.slug"
                  :to="`/${child.slug}`"
                  class="flex items-center gap-2 text-sm text-ed-on-surface-variant transition-colors hover:text-ed-primary dark:text-slate-400 dark:hover:text-blue-300"
                >
                  <span class="material-symbols-ed text-sm opacity-70">chevron_right</span>
                  {{ child.title }}
                </NuxtLink>
                <span v-else class="flex items-center gap-2 text-sm text-ed-on-surface-variant/80">
                  {{ child.title }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section v-if="(recentPosts as any)?.posts?.length">
        <div class="mb-6 max-w-3xl">
          <p
            class="mb-2 font-ed-headline text-sm font-bold uppercase tracking-widest text-ed-on-surface-variant/70"
          >
            {{ t('home.sectionPosts') }}
          </p>
          <h2 class="font-ed-headline text-2xl font-bold text-ed-primary dark:text-blue-300">
            {{ t('admin.posts') }}
          </h2>
          <p class="mt-2 text-ed-on-surface-variant dark:text-slate-400">
            {{ t('home.sectionPostsDesc') }}
          </p>
        </div>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="post in (recentPosts as any).posts"
            :key="post._id"
            :to="`/${locString(post.slug, lang)}`"
            class="group flex flex-col rounded-xl border border-ed-outline-variant/10 bg-ed-surface-container-lowest p-6 shadow-sm transition-all hover:border-ed-primary/25 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80"
          >
            <span class="material-symbols-ed mb-3 text-2xl text-ed-primary">newspaper</span>
            <h3
              class="font-ed-headline text-lg font-bold text-ed-on-surface group-hover:text-ed-primary dark:text-slate-100"
            >
              {{ locString(post.title, lang) }}
            </h3>
            <p
              v-if="locString(post.excerpt, lang)"
              class="mt-2 line-clamp-3 text-sm leading-relaxed text-ed-on-surface-variant dark:text-slate-400"
            >
              {{ locString(post.excerpt, lang) }}
            </p>
            <time
              v-if="post.createdAt"
              class="mt-4 text-xs text-ed-on-surface-variant dark:text-slate-500"
              :datetime="new Date(post.createdAt).toISOString()"
            >
              {{ new Date(post.createdAt).toLocaleDateString() }}
            </time>
          </NuxtLink>
        </div>
      </section>

      <div
        v-if="status === 'success' && !menuTree.length && !(recentPosts as any)?.posts?.length"
        class="rounded-xl border border-dashed border-ed-outline-variant/40 bg-ed-surface-container-low/50 px-6 py-16 text-center dark:border-slate-600 dark:bg-slate-800/50"
      >
        <span class="material-symbols-ed mx-auto mb-4 block text-5xl text-ed-on-surface-variant/50">
          library_books
        </span>
        <p class="font-ed-headline font-medium text-ed-on-surface dark:text-slate-200">
          {{ t('home.emptyTitle') }}
        </p>
        <p class="mx-auto mt-2 max-w-md text-sm text-ed-on-surface-variant dark:text-slate-400">
          {{ t('home.emptyHint') }}
        </p>
      </div>
    </div>
  </div>
</template>
