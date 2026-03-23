<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer
    class="mt-24 flex w-full flex-col items-center gap-4 border-t border-slate-200 bg-[#f7f9fb] py-12 dark:border-slate-800 dark:bg-slate-900"
  >
    <div class="mb-4 flex flex-wrap justify-center gap-8">
      <NuxtLink
        to="/chinh-sach-rieng-tu"
        class="font-body text-xs text-[#454652] underline decoration-[#003aa0] underline-offset-2 transition-colors hover:text-[#191c1e] dark:text-slate-500 dark:hover:text-slate-300"
      >
        Chính sách riêng tư
      </NuxtLink>
      <NuxtLink
        to="/dieu-khoan"
        class="font-body text-xs text-[#454652] transition-colors hover:text-[#191c1e] dark:text-slate-500 dark:hover:text-slate-300"
      >
        Điều khoản
      </NuxtLink>
      <NuxtLink
        to="/lien-he-ho-tro"
        class="font-body text-xs text-[#454652] transition-colors hover:text-[#191c1e] dark:text-slate-500 dark:hover:text-slate-300"
      >
        Liên hệ hỗ trợ
      </NuxtLink>
    </div>
    <p class="font-body text-xs text-[#454652] dark:text-slate-500">
      © {{ year }} CMS Demego. Xây dựng cho sự rõ ràng.
    </p>
  </footer>
</template>
