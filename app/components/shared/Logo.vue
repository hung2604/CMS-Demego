<script setup lang="ts">
const { siteName, logo } = useSettings()

const logoSrc = computed(() => {
  const u = logo.value?.trim()
  return u && u.length > 0 ? u : '/images/logo.png'
})
</script>

<template>
  <img
    :src="logoSrc"
    :alt="siteName"
    class="h-8 w-auto max-h-9 object-contain object-left"
    decoding="async"
    loading="lazy"
  >
</template>
