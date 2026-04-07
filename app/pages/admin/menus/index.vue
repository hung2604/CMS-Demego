<script setup lang="ts">
import { normalizeMenuTitleFields } from '../../../../utils/menu-title'

definePageMeta({ layout: 'admin' })

const { t } = useI18n()
const toast = useToast()

useSeoMeta({ title: t('admin.menus') })

const { data: menus, refresh, status } = await useFetch<Record<string, unknown>[]>('/api/menus', {
  default: () => [],
  transform: (payload) => (Array.isArray(payload) ? payload : [])
})
const { data: postsData } = await useFetch('/api/posts', { query: { limit: 100 } })

const posts = computed(() => (postsData.value as any)?.posts ?? [])

const menuTree = computed(() => buildMenuTree(menus.value, true))

const showForm = ref(false)
const editingMenu = ref<any>(null)

const form = reactive({
  titleVi: '',
  titleEn: '',
  slug: '',
  icon: '',
  parentId: null as string | null,
  order: 0,
  postId: null as string | null
})

function adminMenuLabel (menu: Record<string, unknown>) {
  const { vi, en } = normalizeMenuTitleFields(menu.title)
  if (vi && en && vi.trim() !== en.trim()) return `${vi} / ${en}`
  return vi.trim() || en.trim() || '—'
}

function resetForm() {
  form.titleVi = ''
  form.titleEn = ''
  form.slug = ''
  form.icon = ''
  form.parentId = null
  form.order = 0
  form.postId = null
  editingMenu.value = null
}

function openCreate() {
  resetForm()
  showForm.value = true
}

function openEdit(menu: any) {
  editingMenu.value = menu
  const titles = normalizeMenuTitleFields(menu.title)
  form.titleVi = titles.vi
  form.titleEn = titles.en
  form.slug = menu.slug
  form.icon = menu.icon || ''
  form.parentId = menu.parentId
  form.order = menu.order
  form.postId = menu.postId
  showForm.value = true
}

const saving = ref(false)

async function save() {
  saving.value = true
  try {
    const body = {
      title: { vi: form.titleVi.trim(), en: form.titleEn.trim() },
      slug: form.slug.trim(),
      icon: form.icon,
      parentId: form.parentId,
      order: form.order,
      postId: form.postId
    }
    if (editingMenu.value) {
      await $fetch(`/api/menus/${editingMenu.value._id}`, {
        method: 'PUT',
        body
      })
    } else {
      await $fetch('/api/menus', {
        method: 'POST',
        body
      })
    }
    toast.add({ title: t('common.success'), color: 'success' })
    showForm.value = false
    resetForm()
    await refresh()
  } catch {
    toast.add({ title: t('common.error'), color: 'error' })
  } finally {
    saving.value = false
  }
}

async function deleteMenu(id: string) {
  if (!confirm(t('admin.confirmDelete'))) return
  try {
    await $fetch(`/api/menus/${id}`, { method: 'DELETE' })
    toast.add({ title: t('common.success'), color: 'success' })
    await refresh()
  } catch {
    toast.add({ title: t('common.error'), color: 'error' })
  }
}

const parentOptions = computed(() => {
  const items = (menus.value as any[]) ?? []
  return [
    { label: '-- None --', value: null },
    ...items
      .filter(m => !editingMenu.value || m._id !== editingMenu.value._id)
      .map(m => ({ label: adminMenuLabel(m as Record<string, unknown>), value: m._id }))
  ]
})

const postOptions = computed(() => [
  { label: '-- None --', value: null },
  ...posts.value.map((p: any) => ({ label: p.title, value: p._id }))
])

watch(() => form.titleVi, (val) => {
  if (!editingMenu.value) {
    form.slug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
})
</script>

<template>
  <div>
    <UDashboardNavbar :title="t('admin.menus')" icon="i-lucide-menu">
      <template #right>
        <UButton icon="i-lucide-plus" size="sm" @click="openCreate">
          {{ t('admin.create') }}
        </UButton>
      </template>
    </UDashboardNavbar>

    <div class="p-6">
      <div v-if="menuTree.length" class="space-y-2">
        <template v-for="menu in menuTree" :key="menu._id">
          <UCard>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <UIcon :name="menu.icon || 'i-lucide-file-text'" class="size-5 text-primary" />
                <div>
                  <p class="font-medium">{{ adminMenuLabel(menu as Record<string, unknown>) }}</p>
                  <p class="text-sm text-muted">/{{ menu.slug }}</p>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <UButton icon="i-lucide-pencil" variant="ghost" size="xs" color="neutral" @click="openEdit(menu)" />
                <UButton icon="i-lucide-trash-2" variant="ghost" size="xs" color="error" @click="deleteMenu(menu._id)" />
              </div>
            </div>

            <div v-if="menu.children?.length" class="mt-3 ml-8">
              <AdminMenuNestedRows
                :menus="menu.children as Record<string, unknown>[]"
                @edit="openEdit($event)"
                @delete="deleteMenu($event)"
              />
            </div>
          </UCard>
        </template>
      </div>

      <div v-else-if="status === 'success'" class="text-center py-12">
        <UIcon name="i-lucide-menu" class="size-12 text-muted mx-auto mb-4" />
        <p class="text-muted mb-4">{{ t('admin.noData') }}</p>
        <UButton icon="i-lucide-plus" @click="openCreate">
          {{ t('admin.create') }} {{ t('admin.menus') }}
        </UButton>
      </div>
    </div>

    <UModal v-model:open="showForm">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-semibold">
            {{ editingMenu ? t('admin.edit') : t('admin.create') }} {{ t('admin.menus') }}
          </h3>

          <p class="text-sm text-muted">
            {{ t('menu.langHint') }}
          </p>

          <UFormField :label="t('menu.titleVi')">
            <UInput v-model="form.titleVi" :placeholder="t('menu.titleVi')" class="w-full" />
          </UFormField>

          <UFormField :label="t('menu.titleEn')">
            <UInput v-model="form.titleEn" :placeholder="t('menu.titleEn')" class="w-full" />
          </UFormField>

          <UFormField :label="t('post.slug')">
            <UInput v-model="form.slug" :placeholder="t('post.slug')" class="w-full" />
          </UFormField>

          <UFormField :label="t('menu.icon')">
            <AdminIconPickerField v-model="form.icon" />
          </UFormField>

          <UFormField :label="t('menu.parent')">
            <USelect v-model="form.parentId" :items="parentOptions" class="w-full" />
          </UFormField>

          <UFormField :label="t('menu.order')">
            <UInputNumber v-model="form.order" :min="0" class="w-32" />
          </UFormField>

          <UFormField :label="t('menu.linkedPost')">
            <USelect v-model="form.postId" :items="postOptions" class="w-full" />
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="outline" @click="showForm = false">
              {{ t('admin.cancel') }}
            </UButton>
            <UButton :loading="saving" @click="save">
              {{ t('admin.save') }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
