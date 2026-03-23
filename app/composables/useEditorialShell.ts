/**
 * Drawer mobile + dark mode (class `dark` trên <html>), bám hành vi mẫu index.html.
 * Theme được lưu localStorage + plugin `editorial-theme.client` khôi phục sau điều hướng.
 */
const THEME_STORAGE_KEY = 'cms-demego-theme'

export function useEditorialShell() {
  const navDrawerOpen = useState('editorial-nav-drawer', () => false)
  const dark = useState('editorial-dark', () => false)

  function openNavDrawer() {
    navDrawerOpen.value = true
    if (import.meta.client) {
      document.documentElement.classList.add('overflow-hidden')
    }
  }

  function closeNavDrawer() {
    navDrawerOpen.value = false
    if (import.meta.client) {
      document.documentElement.classList.remove('overflow-hidden')
    }
  }

  function toggleNavDrawer() {
    if (navDrawerOpen.value) {
      closeNavDrawer()
    }
    else {
      openNavDrawer()
    }
  }

  function toggleDark() {
    dark.value = !dark.value
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', dark.value)
      localStorage.setItem(THEME_STORAGE_KEY, dark.value ? 'dark' : 'light')
    }
  }

  return {
    navDrawerOpen,
    dark,
    openNavDrawer,
    closeNavDrawer,
    toggleNavDrawer,
    toggleDark,
  }
}
