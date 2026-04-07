export default defineNuxtPlugin(async () => {
  // Shared keys với useSettings() / useMenus() — một cache cho toàn app
  await Promise.allSettled([
    useFetch('/api/settings', { key: 'settings' }),
    useFetch<Record<string, unknown>[]>('/api/menus', {
      key: 'menus',
      default: () => [],
      transform: (payload) => (Array.isArray(payload) ? payload : [])
    })
  ])
})
