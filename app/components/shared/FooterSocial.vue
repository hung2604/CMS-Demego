<script setup lang="ts">
const { socialLinkItems } = useSettings()
</script>

<template>
  <div
    v-if="socialLinkItems.length"
    class="flex flex-wrap items-center justify-end gap-0.5 sm:gap-1"
  >
    <UButton
      v-for="item in socialLinkItems"
      :key="item.key"
      :to="item.url"
      target="_blank"
      rel="noopener noreferrer"
      external
      :icon="item.icon"
      color="neutral"
      variant="ghost"
      size="sm"
      :aria-label="item.label"
    />
  </div>
</template>
