<script setup lang="ts">
import { normalizeMenuTitleFields } from '../../../utils/menu-title'

defineOptions({ name: 'AdminMenuNestedRows' })

export type AdminMenuRow = Record<string, unknown> & { children?: AdminMenuRow[] }

defineProps<{
  menus: AdminMenuRow[]
}>()

defineEmits<{
  edit: [menu: AdminMenuRow]
  delete: [id: string]
}>()

function adminMenuLabel (menu: Record<string, unknown>) {
  const { vi, en } = normalizeMenuTitleFields(menu.title)
  if (vi && en && vi.trim() !== en.trim()) return `${vi} / ${en}`
  return vi.trim() || en.trim() || '—'
}
</script>

<template>
  <div class="space-y-2">
    <div v-for="menu in menus" :key="String(menu._id)" class="space-y-2">
      <div class="flex items-center justify-between p-2 rounded-md bg-muted/50">
        <div class="flex items-center gap-2">
          <UIcon :name="(menu.icon as string) || 'i-lucide-file-text'" class="size-4 text-muted" />
          <div>
            <p class="text-sm font-medium">{{ adminMenuLabel(menu) }}</p>
            <p class="text-xs text-muted">/{{ menu.slug }}</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <UButton
            icon="i-lucide-pencil"
            variant="ghost"
            size="xs"
            color="neutral"
            @click="$emit('edit', menu)"
          />
          <UButton
            icon="i-lucide-trash-2"
            variant="ghost"
            size="xs"
            color="error"
            @click="$emit('delete', String(menu._id))"
          />
        </div>
      </div>
      <div v-if="menu.children?.length" class="ml-6 space-y-2 border-l border-default pl-3">
        <AdminMenuNestedRows
          :menus="menu.children"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>
    </div>
  </div>
</template>
