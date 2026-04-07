<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t, te } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const showRegister = computed(() => {
  const r = route.query.register
  return r === '1' || r === 'true'
})

const pageTitle = computed(() => (showRegister.value ? t('auth.registerTitle') : t('auth.loginTitle')))
useSeoMeta({ title: pageTitle })

const { data: registerStatus, pending: registerStatusPending, refresh: refreshRegisterStatus } = useFetch(
  '/api/auth/register-status',
  { immediate: false }
)

watch(
  showRegister,
  (v) => {
    if (v) refreshRegisterStatus()
  },
  { immediate: true }
)

const email = ref('')
const password = ref('')
const name = ref('')
const passwordConfirm = ref('')
const loading = ref(false)

function mapErrorMessage (msg: string | undefined) {
  if (!msg) return t('auth.genericError')
  const path = `auth.errors.${msg}`
  return te(path) ? t(path) : msg
}

function setRegisterMode (value: boolean) {
  const q = { ...route.query } as Record<string, string | string[] | undefined>
  if (value) q.register = '1'
  else delete q.register
  void router.replace({ path: '/admin/login', query: q })
}

async function onLoginSubmit () {
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

async function onRegisterSubmit () {
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
        <UIcon
          :name="showRegister ? 'i-lucide-user-plus' : 'i-lucide-log-in'"
          class="size-5 text-primary"
        />
        <h1 class="text-lg font-semibold">
          {{ showRegister ? t('auth.registerTitle') : t('auth.loginTitle') }}
        </h1>
      </div>
    </template>

    <template v-if="!showRegister">
      <form class="flex flex-col gap-4" @submit.prevent="onLoginSubmit">
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
    </template>

    <template v-else>
      <UAlert
        v-if="registerStatus && !registerStatus.allowed"
        color="warning"
        variant="subtle"
        :title="t('auth.registerDisabledTitle')"
        :description="t('auth.registerDisabledHint')"
        class="mb-4"
      />

      <form class="flex flex-col gap-4" @submit.prevent="onRegisterSubmit">
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
    </template>

    <template #footer>
      <p v-if="!showRegister" class="text-muted text-center text-sm">
        <button
          type="button"
          class="text-primary font-medium hover:underline"
          @click="setRegisterMode(true)"
        >
          {{ t('auth.registerLink') }}
        </button>
      </p>
      <p v-else class="text-muted text-center text-sm">
        <button
          type="button"
          class="text-primary font-medium hover:underline"
          @click="setRegisterMode(false)"
        >
          {{ t('auth.loginLink') }}
        </button>
      </p>
    </template>
  </UCard>
</template>
