<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { t } = useI18n()

useSeoMeta({ title: t('admin.dashboard') })

const { data: stats } = await useFetch('/api/posts', {
  query: { countOnly: true }
})

const { data: menuCount } = await useFetch('/api/menus', {
  query: { countOnly: true }
})
</script>

<template>
  <div>
    <UDashboardNavbar :title="t('admin.dashboard')" icon="i-lucide-layout-dashboard" />

    <div class="p-6">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UCard>
          <div class="flex items-center gap-4">
            <div class="rounded-lg bg-primary/10 p-3">
              <UIcon name="i-lucide-file-text" class="size-6 text-primary" />
            </div>
            <div>
              <p class="text-sm text-muted">{{ t('admin.posts') }}</p>
              <p class="text-2xl font-bold">{{ (stats as any)?.total ?? 0 }}</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center gap-4">
            <div class="rounded-lg bg-primary/10 p-3">
              <UIcon name="i-lucide-menu" class="size-6 text-primary" />
            </div>
            <div>
              <p class="text-sm text-muted">{{ t('admin.menus') }}</p>
              <p class="text-2xl font-bold">{{ (menuCount as any)?.total ?? 0 }}</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center gap-4">
            <div class="rounded-lg bg-primary/10 p-3">
              <UIcon name="i-lucide-settings" class="size-6 text-primary" />
            </div>
            <div>
              <p class="text-sm text-muted">{{ t('admin.settings') }}</p>
              <p class="text-2xl font-bold">
                <NuxtLink to="/admin/settings" class="text-primary hover:underline">
                  {{ t('admin.edit') }}
                </NuxtLink>
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <div class="mt-8">
        <h3 class="font-semibold mb-4">{{ t('common.actions') }}</h3>
        <div class="flex flex-wrap gap-3">
          <UButton to="/admin/posts/create" icon="i-lucide-plus">
            {{ t('admin.create') }} {{ t('admin.posts') }}
          </UButton>
          <UButton to="/admin/menus" variant="outline" icon="i-lucide-menu">
            {{ t('admin.menus') }}
          </UButton>
          <UButton to="/admin/settings" variant="outline" icon="i-lucide-settings">
            {{ t('admin.settings') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
