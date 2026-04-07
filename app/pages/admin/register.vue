<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const route = useRoute()
await navigateTo({
  path: '/admin/login',
  query: { ...route.query, register: '1' },
  replace: true
})
</script>

<template>
  <div />
</template>
