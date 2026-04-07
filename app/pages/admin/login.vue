<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const route = useRoute()
const toast = useToast()
const { te } = useI18n()

useSeoMeta({ title: () => t('auth.loginTitle') })

const email = ref('')
const password = ref('')
const loading = ref(false)

function mapErrorMessage (msg: string | undefined) {
  if (!msg) return t('auth.genericError')
  const path = `auth.errors.${msg}`
  return te(path) ? t(path) : msg
}

async function onSubmit () {
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    const { fetch } = useUserSession()
    await fetch()
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin'
    await navigateTo(redirect)
  } catch (e: unknown) {
    const msg = e && typeof e === 'object' && 'data' in e
      ? (e as { data?: { statusMessage?: string } }).data?.statusMessage
      : undefined
    toast.add({
      title: t('auth.loginFailed'),
      description: mapErrorMessage(msg),
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-log-in" class="size-5 text-primary" />
        <h1 class="text-lg font-semibold">{{ t('auth.loginTitle') }}</h1>
      </div>
    </template>

    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <UFormField :label="t('auth.email')" name="email" required>
        <UInput v-model="email" type="email" autocomplete="email" class="w-full" />
      </UFormField>
      <UFormField :label="t('auth.password')" name="password" required>
        <UInput v-model="password" type="password" autocomplete="current-password" class="w-full" />
      </UFormField>
      <UButton type="submit" block :loading="loading">
        {{ t('auth.signIn') }}
      </UButton>
    </form>

    <template #footer>
      <p class="text-muted text-center text-sm">
        <NuxtLink to="/admin/register" class="text-primary font-medium hover:underline">
          {{ t('auth.registerLink') }}
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>
