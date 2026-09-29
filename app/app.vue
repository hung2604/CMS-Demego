<script setup lang="ts">
import { en as uiEn, vi as uiVi } from '@nuxt/ui/locale'

const { t, locale } = useI18n()
/** Chuỗi của component Nuxt UI (ô tìm kiếm trong dropdown, "Không có dữ liệu"…) theo ngôn ngữ trang */
const uiLocale = computed(() => (locale.value === 'en' ? uiEn : uiVi))
const { siteName, siteDescription } = useSettings()

useSeoMeta({
  titleTemplate: computed(() => `%s - ${siteName.value}`),
  description: computed(() => siteDescription.value || t('app.description'))
})
</script>

<template>
  <UApp :locale="uiLocale">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UToaster />
  </UApp>
</template>
