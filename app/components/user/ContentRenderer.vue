<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>

<template>
  <div class="post-richtext max-w-none" v-html="content" />
</template>
