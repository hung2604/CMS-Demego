<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { t } = useI18n()
const toast = useToast()

useSeoMeta({ title: t('admin.settings') })

const { data: settings } = await useFetch('/api/settings', { key: 'settings' })

const form = reactive({
  siteName: (settings.value as any)?.siteName ?? 'CMS Demego',
  siteDescription: (settings.value as any)?.siteDescription ?? '',
  logo: (settings.value as any)?.logo ?? '',
  favicon: (settings.value as any)?.favicon ?? '',
  footerText: (settings.value as any)?.footerText ?? '',
  socialLinks: {
    facebook: '',
    twitter: '',
    github: '',
    youtube: '',
    ...(settings.value as any)?.socialLinks
  }
})

const saving = ref(false)

async function save() {
  saving.value = true
  try {
    await $fetch('/api/settings', {
      method: 'PUT',
      body: form
    })
    await refreshNuxtData('settings')
    toast.add({ title: t('common.success'), color: 'success' })
  } catch {
    toast.add({ title: t('common.error'), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <UDashboardNavbar :title="t('admin.settings')" icon="i-lucide-settings">
      <template #right>
        <UButton icon="i-lucide-save" size="sm" :loading="saving" @click="save">
          {{ t('admin.save') }}
        </UButton>
      </template>
    </UDashboardNavbar>

    <div class="p-6 max-w-2xl">
      <div class="space-y-6">
        <UFormField :label="t('settings.siteName')">
          <UInput v-model="form.siteName" :placeholder="t('settings.siteName')" class="w-full" />
        </UFormField>

        <UFormField :label="t('settings.siteDescription')">
          <UTextarea v-model="form.siteDescription" :placeholder="t('settings.siteDescription')" :rows="3" class="w-full" />
        </UFormField>

        <UFormField :label="t('settings.logo')">
          <AdminSettingsAssetUrlField v-model="form.logo" kind="logo" />
        </UFormField>

        <UFormField :label="t('settings.favicon')">
          <AdminSettingsAssetUrlField v-model="form.favicon" kind="favicon" />
        </UFormField>

        <UFormField :label="t('settings.footerText')">
          <UTextarea v-model="form.footerText" :placeholder="t('settings.footerText')" :rows="2" class="w-full" />
        </UFormField>

        <USeparator />

        <h3 class="font-semibold">{{ t('settings.socialLinks') }}</h3>

        <UFormField label="Facebook">
          <UInput v-model="form.socialLinks.facebook" placeholder="https://facebook.com/..." class="w-full" />
        </UFormField>

        <UFormField label="Twitter / X">
          <UInput v-model="form.socialLinks.twitter" placeholder="https://x.com/..." class="w-full" />
        </UFormField>

        <UFormField label="GitHub">
          <UInput v-model="form.socialLinks.github" placeholder="https://github.com/..." class="w-full" />
        </UFormField>

        <UFormField :label="t('settings.youtube')">
          <UInput v-model="form.socialLinks.youtube" placeholder="https://youtube.com/@..." class="w-full" />
        </UFormField>
      </div>
    </div>
  </div>
</template>
