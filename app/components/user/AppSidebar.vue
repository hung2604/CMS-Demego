<script setup lang="ts">
const { t } = useI18n()
const { navigationItems, status } = useMenus()
</script>

<template>
  <aside class="hidden lg:block w-64 shrink-0">
    <nav class="sticky top-20">
      <h3 class="font-semibold text-sm text-muted mb-4">
        {{ t('sidebar.title') }}
      </h3>
      <UNavigationMenu
        v-if="navigationItems.length"
        :items="navigationItems"
        orientation="vertical"
      />
      <p v-else-if="status === 'success'" class="text-sm text-muted">
        {{ t('sidebar.noItems') }}
      </p>
      <div v-else class="space-y-2">
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-3/4" />
        <USkeleton class="h-4 w-1/2" />
      </div>
    </nav>
  </aside>
</template>
