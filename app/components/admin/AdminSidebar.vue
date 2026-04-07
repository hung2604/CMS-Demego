<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { t } = useI18n()
const route = useRoute()
const { user, fetch: refreshSession } = useUserSession()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: t('admin.dashboard'),
    icon: 'i-lucide-layout-dashboard',
    to: '/admin',
    active: route.path === '/admin'
  },
  {
    label: t('admin.posts'),
    icon: 'i-lucide-file-text',
    to: '/admin/posts',
    active: route.path.startsWith('/admin/posts')
  },
  {
    label: t('admin.menus'),
    icon: 'i-lucide-menu',
    to: '/admin/menus',
    active: route.path.startsWith('/admin/menus')
  },
  {
    label: t('admin.storage'),
    icon: 'i-lucide-images',
    to: '/admin/storage',
    active: route.path.startsWith('/admin/storage')
  },
  {
    label: t('admin.users'),
    icon: 'i-lucide-users',
    to: '/admin/users',
    active: route.path.startsWith('/admin/users')
  },
  {
    label: t('admin.settings'),
    icon: 'i-lucide-settings',
    to: '/admin/settings',
    active: route.path.startsWith('/admin/settings')
  }
])

async function logout () {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await refreshSession()
  await navigateTo('/admin/login')
}
</script>

<template>
  <UDashboardSidebar
    collapsible
    resizable
    :min-size="15"
    :default-size="20"
    :max-size="30"
  >
    <template #header="{ collapsed }">
      <div class="flex items-center gap-2 px-2" :class="{ 'justify-center': collapsed }">
        <UIcon name="i-lucide-blocks" class="size-6 shrink-0 text-primary" />
        <span v-if="!collapsed" class="truncate text-lg font-bold">{{ t('app.name') }}</span>
      </div>
    </template>

    <template #default="{ collapsed }">
      <UNavigationMenu
        :collapsed="collapsed"
        tooltip
        highlight
        highlight-color="primary"
        color="neutral"
        orientation="vertical"
        class="w-full"
        :items="items"
      />
    </template>

    <template #footer="{ collapsed }">
      <div
        class="flex flex-col gap-3 px-2"
        :class="{ 'items-center': collapsed }"
      >
        <p
          v-if="user?.email && !collapsed"
          class="text-muted truncate text-xs"
          :title="user.email"
        >
          {{ user.email }}
        </p>
        <div
          class="flex w-full gap-2"
          :class="collapsed ? 'flex-col items-center' : 'items-center justify-between'"
        >
          <NuxtLink
            to="/"
            class="text-muted hover:text-primary flex items-center gap-1 text-sm transition-colors"
            :class="{ 'justify-center': collapsed }"
            :aria-label="collapsed ? t('nav.home') : undefined"
          >
            <UIcon name="i-lucide-external-link" class="size-4 shrink-0" />
            <span v-if="!collapsed">{{ t('nav.home') }}</span>
          </NuxtLink>
          <div class="flex items-center gap-1" :class="{ 'flex-col': collapsed }">
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-lucide-log-out"
              :aria-label="t('auth.logout')"
              :title="collapsed ? t('auth.logout') : undefined"
              @click="logout"
            >
              <span v-if="!collapsed">{{ t('auth.logout') }}</span>
            </UButton>
            <UColorModeButton size="xs" />
          </div>
        </div>
      </div>
    </template>
  </UDashboardSidebar>
</template>
