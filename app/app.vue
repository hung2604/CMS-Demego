<script setup lang="ts">
const { t } = useI18n()
const { siteName, siteDescription } = useSettings()

useSeoMeta({
  titleTemplate: computed(() => `%s - ${siteName.value}`),
  description: computed(() => siteDescription.value || t('app.description'))
})
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UToaster />
  </UApp>
</template>
