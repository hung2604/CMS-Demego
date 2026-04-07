<script setup lang="ts">
const { t } = useI18n()
const { siteName, footerText } = useSettings()
</script>

<template>
  <div>
    <USeparator />
    <UFooter>
      <template #left>
        <div class="space-y-1">
          <p class="text-muted text-sm">
            {{ t('footer.copyright', { year: new Date().getFullYear(), siteName }) }}
          </p>
          <p v-if="footerText" class="text-muted text-xs max-w-prose">
            {{ footerText }}
          </p>
        </div>
      </template>

      <template #right>
        <SharedFooterSocial />
      </template>
    </UFooter>
  </div>
</template>
