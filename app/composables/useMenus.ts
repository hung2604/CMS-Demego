import type { NavigationMenuItem } from '@nuxt/ui'

export function useMenus() {
  const { locale } = useI18n()
  const menuLoc = computed(() => (locale.value === 'en' ? 'en' : 'vi') as const)

  const { data: menus, refresh, status } = useFetch<Record<string, unknown>[]>('/api/menus', {
    key: 'menus',
    default: () => [],
       transform: (payload) => (Array.isArray(payload) ? payload : [])
  })

  const menuTree = computed(() => buildMenuTree(menus.value, false, menuLoc.value))

  const navigationItems = computed<NavigationMenuItem[]>(() => {
    return toNavItems(menuTree.value)
  })

  function toNavItems(tree: any[]): NavigationMenuItem[] {
    return tree.map(item => ({
      label: item.title,
      icon: item.icon || 'i-lucide-file-text',
      to: item.slug ? `/${item.slug}` : undefined,
      children: item.children?.length ? toNavItems(item.children) : undefined
    }))
  }

  return {
    menus,
    menuTree,
    navigationItems,
    refresh,
    status
  }
}
