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
/** Nhãn menu cha khi mở form từ nút "Thêm menu con" (hiển thị ở tiêu đề form) */
const childParentLabel = ref<string | null>(null)

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
  childParentLabel.value = null
}

function openCreate() {
  resetForm()
  showForm.value = true
}

/** Tạo menu con: điền sẵn menu cha, thứ tự = cuối danh sách con hiện có */
function openCreateChild(parent: any) {
  resetForm()
  form.parentId = String(parent._id)
  const siblings: any[] = parent.children ?? []
  form.order = siblings.length
    ? Math.max(...siblings.map(c => Number(c.order) || 0)) + 1
    : 0
  childParentLabel.value = adminMenuLabel(parent as Record<string, unknown>)
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

type PickerOption = { label: string; value: string | null; description?: string }

/**
 * Menu cha theo thứ tự cây; description = đường dẫn cha (phân biệt menu trùng tên, tìm theo nhánh).
 * Khi sửa: bỏ chính menu đó và các menu con của nó (tránh tạo vòng lặp).
 */
const parentOptions = computed<PickerOption[]>(() => {
  const acc: PickerOption[] = [{ label: '-- None --', value: null }]
  const editingId = editingMenu.value ? String(editingMenu.value._id) : null
  function walk (nodes: any[], path: string[]) {
    for (const n of nodes) {
      const id = String(n._id)
      if (id === editingId) continue
      const label = adminMenuLabel(n as Record<string, unknown>)
      acc.push({ label, value: id, description: path.length ? path.join(' › ') : undefined })
      if (n.children?.length) walk(n.children, [...path, label])
    }
  }
  walk(menuTree.value, [])
  return acc
})

const postOptions = computed<PickerOption[]>(() => [
  { label: '-- None --', value: null },
  ...posts.value.map((p: any) => ({
    label: p.title?.vi || p.title?.en || '—',
    value: String(p._id),
    description: p.slug?.vi ? `/${p.slug.vi}` : undefined
  }))
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
                <UButton
                  icon="i-lucide-plus"
                  variant="ghost"
                  size="xs"
                  color="primary"
                  :aria-label="t('menu.addChild')"
                  :title="t('menu.addChild')"
                  @click="openCreateChild(menu)"
                />
                <UButton icon="i-lucide-pencil" variant="ghost" size="xs" color="neutral" @click="openEdit(menu)" />
                <UButton icon="i-lucide-trash-2" variant="ghost" size="xs" color="error" @click="deleteMenu(menu._id)" />
              </div>
            </div>

            <div v-if="menu.children?.length" class="mt-3 ml-8">
              <AdminMenuNestedRows
                :menus="menu.children as Record<string, unknown>[]"
                @edit="openEdit($event)"
                @delete="deleteMenu($event)"
                @add-child="openCreateChild($event)"
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
            <template v-if="childParentLabel">
              {{ t('menu.addChildOf', { parent: childParentLabel }) }}
            </template>
            <template v-else>
              {{ editingMenu ? t('admin.edit') : t('admin.create') }} {{ t('admin.menus') }}
            </template>
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
            <USelectMenu
              v-model="form.parentId"
              :items="parentOptions"
              value-key="value"
              :filter-fields="['label', 'description']"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('menu.order')">
            <UInputNumber v-model="form.order" :min="0" class="w-32" />
          </UFormField>

          <UFormField :label="t('menu.linkedPost')">
            <USelectMenu
              v-model="form.postId"
              :items="postOptions"
              value-key="value"
              :filter-fields="['label', 'description']"
              class="w-full"
            />
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
