<script setup lang="ts">
const { siteName, logo } = useSettings()

const customLogo = computed(() => logo.value?.trim() || '')
const logoSrc = computed(() => customLogo.value || '/images/logo.png')
</script>

<template>
  <!-- Logo nằm trên header (above the fold): không lazy-load; logo mặc định có sẵn kích thước để tránh layout shift -->
  <img
    :src="logoSrc"
    :alt="siteName"
    :width="customLogo ? undefined : 152"
    :height="customLogo ? undefined : 72"
    class="h-8 w-auto max-h-9 object-contain object-left"
    decoding="async"
  >
</template>
