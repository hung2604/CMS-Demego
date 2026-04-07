<script setup lang="ts">
defineProps<{
  menus: any[]
}>()

defineEmits<{
  edit: [menu: any]
  delete: [id: string]
}>()
</script>

<template>
  <div class="space-y-2">
    <template v-for="menu in menus" :key="menu._id">
      <UCard>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon :name="menu.icon || 'i-lucide-file-text'" class="size-5 text-primary" />
            <div>
              <p class="font-medium">{{ menu.title }}</p>
              <p class="text-sm text-muted">/{{ menu.slug }}</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <UButton icon="i-lucide-pencil" variant="ghost" size="xs" color="neutral" @click="$emit('edit', menu)" />
            <UButton icon="i-lucide-trash-2" variant="ghost" size="xs" color="error" @click="$emit('delete', menu._id)" />
          </div>
        </div>

        <div v-if="menu.children?.length" class="mt-3 ml-8 space-y-2">
          <div
            v-for="child in menu.children"
            :key="child._id"
            class="flex items-center justify-between p-2 rounded-md bg-muted/50"
          >
            <div class="flex items-center gap-2">
              <UIcon :name="child.icon || 'i-lucide-file-text'" class="size-4 text-muted" />
              <div>
                <p class="text-sm font-medium">{{ child.title }}</p>
                <p class="text-xs text-muted">/{{ child.slug }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <UButton icon="i-lucide-pencil" variant="ghost" size="xs" color="neutral" @click="$emit('edit', child)" />
              <UButton icon="i-lucide-trash-2" variant="ghost" size="xs" color="error" @click="$emit('delete', child._id)" />
            </div>
          </div>
        </div>
      </UCard>
    </template>
  </div>
</template>
