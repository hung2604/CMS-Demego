<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <UHeader
    :title="t('app.name')"
    to="/"
    :toggle="false"
  >
    <template #title>
      <SharedLogo />
    </template>

    <template #right>
      <SharedLocaleSwitch />
      <SharedColorModeToggle />
    </template>
  </UHeader>
</template>
