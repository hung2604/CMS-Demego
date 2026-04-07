<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t, te } = useI18n()
const toast = useToast()

useSeoMeta({ title: () => t('auth.registerTitle') })

const { data: registerStatus, pending: registerStatusPending } = await useFetch('/api/auth/register-status')

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const loading = ref(false)

function mapErrorMessage (msg: string | undefined) {
  if (!msg) return t('auth.genericError')
  const path = `auth.errors.${msg}`
  return te(path) ? t(path) : msg
}

async function onSubmit () {
  if (password.value !== passwordConfirm.value) {
    toast.add({
      title: t('auth.registerFailed'),
      description: t('auth.passwordMismatch'),
      color: 'error'
    })
    return
  }

  loading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
        name: name.value || undefined
      }
    })
    const { fetch } = useUserSession()
    await fetch()
    await navigateTo('/admin')
  } catch (e: unknown) {
    const err = e && typeof e === 'object' && 'data' in e
      ? (e as { data?: { statusMessage?: string } }).data
      : undefined
    toast.add({
      title: t('auth.registerFailed'),
      description: mapErrorMessage(err?.statusMessage),
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
        <UIcon name="i-lucide-user-plus" class="size-5 text-primary" />
        <h1 class="text-lg font-semibold">{{ t('auth.registerTitle') }}</h1>
      </div>
    </template>

    <UAlert
      v-if="registerStatus && !registerStatus.allowed"
      color="warning"
      variant="subtle"
      :title="t('auth.registerDisabledTitle')"
      :description="t('auth.registerDisabledHint')"
      class="mb-4"
    />

    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <UFormField :label="t('auth.nameOptional')" name="name">
        <UInput v-model="name" type="text" autocomplete="name" class="w-full" />
      </UFormField>
      <UFormField :label="t('auth.email')" name="email" required>
        <UInput v-model="email" type="email" autocomplete="email" class="w-full" />
      </UFormField>
      <UFormField :label="t('auth.password')" name="password" required>
        <UInput v-model="password" type="password" autocomplete="new-password" class="w-full" />
      </UFormField>
      <UFormField :label="t('auth.passwordConfirm')" name="passwordConfirm" required>
        <UInput v-model="passwordConfirm" type="password" autocomplete="new-password" class="w-full" />
      </UFormField>
      <UButton
        type="submit"
        block
        :loading="loading"
        :disabled="registerStatusPending || registerStatus?.allowed === false"
      >
        {{ t('auth.signUp') }}
      </UButton>
    </form>

    <template #footer>
      <p class="text-muted text-center text-sm">
        <NuxtLink to="/admin/login" class="text-primary font-medium hover:underline">
          {{ t('auth.loginLink') }}
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>
