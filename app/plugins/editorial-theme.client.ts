/**
 * Khôi phục dark mode từ localStorage + giữ class `dark` trên <html> sau mỗi lần điều hướng.
 */
const STORAGE_KEY = 'cms-demego-theme'

export default defineNuxtPlugin(() => {
  const dark = useState('editorial-dark', () => false)

  function applyFromState() {
    document.documentElement.classList.toggle('dark', dark.value)
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark') {
    dark.value = true
  }
  else if (stored === 'light') {
    dark.value = false
  }
  applyFromState()

  const router = useRouter()
  router.afterEach(() => {
    applyFromState()
  })
})
