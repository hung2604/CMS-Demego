<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { t } = useI18n()
const toast = useToast()

useSeoMeta({ title: t('admin.posts') })

const search = ref('')
const page = ref(1)
const limit = 10

const { data, refresh, status } = await useFetch('/api/posts', {
  query: computed(() => ({
    search: search.value || undefined,
    page: page.value,
    limit
  }))
})

const posts = computed(() => (data.value as any)?.posts ?? [])
const total = computed(() => (data.value as any)?.total ?? 0)

const columns = computed(() => [
  { id: 'title', header: t('post.title'), enableSorting: false },
  { id: 'slug', header: t('post.slug'), enableSorting: false },
  { accessorKey: 'status', header: t('post.status') },
  { accessorKey: 'createdAt', header: t('post.createdAt') },
  { id: 'actions', header: t('common.actions'), enableSorting: false }
])

async function deletePost(id: string) {
  if (!confirm(t('admin.confirmDelete'))) return

  try {
    await $fetch(`/api/posts/${id}`, { method: 'DELETE' })
    toast.add({ title: t('common.success'), color: 'success' })
    await refresh()
  } catch {
    toast.add({ title: t('common.error'), color: 'error' })
  }
}
</script>

<template>
  <div>
    <UDashboardNavbar :title="t('admin.posts')" icon="i-lucide-file-text">
      <template #right>
        <UButton to="/admin/posts/create" icon="i-lucide-plus" size="sm">
          {{ t('admin.create') }}
        </UButton>
      </template>
    </UDashboardNavbar>

    <div class="p-6">
      <div class="mb-4">
        <UInput
          v-model="search"
          :placeholder="t('admin.search')"
          icon="i-lucide-search"
          class="max-w-sm"
        />
      </div>

      <UTable
        :data="posts"
        :columns="columns"
        :loading="status === 'pending'"
      >
        <template #title-cell="{ row }">
          <div class="flex flex-col gap-0.5">
            <span class="font-medium">{{ row.original.title?.vi || '—' }}</span>
            <span v-if="row.original.title?.en" class="text-xs text-muted">{{ row.original.title.en }}</span>
          </div>
        </template>

        <template #slug-cell="{ row }">
          <div class="flex flex-col gap-0.5 font-mono text-xs">
            <span>🇻🇳 {{ row.original.slug?.vi || '—' }}</span>
            <span class="text-muted">🇬🇧 {{ row.original.slug?.en || '—' }}</span>
          </div>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="row.original.status === 'published' ? 'success' : 'neutral'"
            variant="subtle"
            size="sm"
          >
            {{ t(`admin.status.${row.original.status}`) }}
          </UBadge>
        </template>

        <template #createdAt-cell="{ row }">
          {{ new Date(row.original.createdAt).toLocaleDateString() }}
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-1">
            <UButton
              :to="`/admin/posts/${row.original._id}`"
              icon="i-lucide-pencil"
              variant="ghost"
              size="xs"
              color="neutral"
            />
            <UButton
              icon="i-lucide-trash-2"
              variant="ghost"
              size="xs"
              color="error"
              @click="deletePost(row.original._id)"
            />
          </div>
        </template>
      </UTable>

      <div v-if="total > limit" class="mt-4 flex justify-center">
        <UPagination
          v-model="page"
          :total="total"
          :items-per-page="limit"
        />
      </div>
    </div>
  </div>
</template>
