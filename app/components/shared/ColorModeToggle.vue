<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'xs' | 'sm' | 'md' | 'lg'
}>(), {
  size: 'md'
})
</script>

<template>
  <UColorModeButton :size="size" />
</template>
