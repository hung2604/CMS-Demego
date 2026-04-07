<script setup lang="ts">
defineProps<{
  title?: string
  icon?: string
}>()
</script>

<template>
  <UDashboardNavbar :title="title" :icon="icon">
    <template v-if="$slots.right" #right>
      <slot name="right" />
    </template>
  </UDashboardNavbar>
</template>
