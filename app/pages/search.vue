<script setup lang="ts">
/**
 * Giữ URL /search?q=... để chia sẻ bookmark; luôn chuyển về trang chủ và mở modal tìm kiếm.
 */
const route = useRoute()
const { open } = useSearchModal()

onMounted(() => {
  const raw = route.query.q
  const q = Array.isArray(raw) ? raw[0] : raw
  open(typeof q === 'string' ? q : '')
  navigateTo('/', { replace: true })
})
</script>

<template>
  <main class="flex min-h-[30vh] items-center justify-center px-4 text-sm text-slate-500">
    Đang mở ô tìm kiếm…
  </main>
</template>
