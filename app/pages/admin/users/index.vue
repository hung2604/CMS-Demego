<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { t, te } = useI18n()
const toast = useToast()
const { user: sessionUser } = useUserSession()

useSeoMeta({ title: t('admin.users') })

const search = ref('')
const createOpen = ref(false)
const createLoading = ref(false)
const createEmail = ref('')
const createName = ref('')
const createPassword = ref('')

const { data, refresh, status } = await useFetch('/api/users', {
  query: computed(() => ({
    search: search.value.trim() || undefined
  }))
})

const users = computed(() => (data.value as { users?: unknown[] })?.users ?? [])

const columns = computed(() => [
  { id: 'email', header: t('auth.email'), enableSorting: false },
  { id: 'name', header: t('admin.usersName'), enableSorting: false },
  { accessorKey: 'createdAt', header: t('post.createdAt') },
  { id: 'actions', header: t('common.actions'), enableSorting: false }
])

function mapErr (msg: string | undefined) {
  if (!msg) return t('common.error')
  const path = `admin.userErrors.${msg}`
  return te(path) ? t(path) : msg
}

async function deleteUser (id: string) {
  if (!confirm(t('admin.confirmDelete'))) return

  try {
    await $fetch(`/api/users/${id}`, { method: 'DELETE' })
    toast.add({ title: t('common.success'), color: 'success' })
    await refresh()
  } catch (e: unknown) {
    const msg = e && typeof e === 'object' && 'data' in e
      ? (e as { data?: { statusMessage?: string } }).data?.statusMessage
      : undefined
    toast.add({ title: mapErr(msg), color: 'error' })
  }
}

function openCreate () {
  createEmail.value = ''
  createName.value = ''
  createPassword.value = ''
  createOpen.value = true
}

async function submitCreate () {
  createLoading.value = true
  try {
    await $fetch('/api/users', {
      method: 'POST',
      body: {
        email: createEmail.value,
        password: createPassword.value,
        name: createName.value || undefined
      }
    })
    toast.add({ title: t('common.success'), color: 'success' })
    createOpen.value = false
    await refresh()
  } catch (e: unknown) {
    const msg = e && typeof e === 'object' && 'data' in e
      ? (e as { data?: { statusMessage?: string } }).data?.statusMessage
      : undefined
    toast.add({
      title: msg === 'emailTaken' ? t('auth.errors.emailTaken') : mapErr(msg),
      color: 'error'
    })
  } finally {
    createLoading.value = false
  }
}
</script>

<template>
  <div>
    <UDashboardNavbar :title="t('admin.users')" icon="i-lucide-users">
      <template #right>
        <UButton icon="i-lucide-user-plus" size="sm" @click="openCreate">
          {{ t('admin.usersCreate') }}
        </UButton>
      </template>
    </UDashboardNavbar>

    <UModal v-model:open="createOpen">
      <template #content>
        <div class="space-y-4 p-6">
          <h3 class="text-lg font-semibold">
            {{ t('admin.usersCreateTitle') }}
          </h3>
          <UFormField :label="t('auth.email')" required>
            <UInput v-model="createEmail" type="email" autocomplete="off" class="w-full" />
          </UFormField>
          <UFormField :label="t('admin.usersName')">
            <UInput v-model="createName" type="text" autocomplete="off" class="w-full" />
          </UFormField>
          <UFormField :label="t('auth.password')" required>
            <UInput v-model="createPassword" type="password" autocomplete="new-password" class="w-full" />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="outline" @click="createOpen = false">
              {{ t('admin.cancel') }}
            </UButton>
            <UButton :loading="createLoading" @click="submitCreate">
              {{ t('admin.save') }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <div class="p-6">
      <p class="text-muted mb-4 text-sm">
        {{ t('admin.usersHint') }}
      </p>

      <div class="mb-4">
        <UInput
          v-model="search"
          :placeholder="t('admin.search')"
          icon="i-lucide-search"
          class="max-w-sm"
        />
      </div>

      <UTable
        :data="users"
        :columns="columns"
        :loading="status === 'pending'"
      >
        <template #email-cell="{ row }">
          <div class="flex items-center gap-2">
            <span class="font-medium">{{ row.original.email }}</span>
            <UBadge
              v-if="sessionUser?.id === row.original._id"
              color="primary"
              variant="subtle"
              size="xs"
            >
              {{ t('admin.usersYou') }}
            </UBadge>
          </div>
        </template>

        <template #name-cell="{ row }">
          {{ row.original.name || '—' }}
        </template>

        <template #createdAt-cell="{ row }">
          {{ row.original.createdAt ? new Date(row.original.createdAt).toLocaleString() : '—' }}
        </template>

        <template #actions-cell="{ row }">
          <UButton
            v-if="sessionUser?.id !== row.original._id"
            icon="i-lucide-trash-2"
            variant="ghost"
            size="xs"
            color="error"
            @click="deleteUser(row.original._id)"
          />
          <span v-else class="text-muted text-xs">—</span>
        </template>
      </UTable>

      <p v-if="status !== 'pending' && users.length === 0" class="text-muted mt-6 text-center text-sm">
        {{ t('admin.noData') }}
      </p>
    </div>
  </div>
</template>
