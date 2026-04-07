const socialPlatformDefs = [
  { key: 'facebook' as const, icon: 'i-simple-icons-facebook', label: 'Facebook' },
  { key: 'twitter' as const, icon: 'i-simple-icons-x', label: 'X' },
  { key: 'github' as const, icon: 'i-simple-icons-github', label: 'GitHub' },
  { key: 'youtube' as const, icon: 'i-simple-icons-youtube', label: 'YouTube' }
]

export function useSettings() {
  const { data: settings, refresh, status } = useFetch('/api/settings', {
    key: 'settings'
  })

  const siteName = computed(() => (settings.value as any)?.siteName ?? 'CMS Demego')
  const siteDescription = computed(() => (settings.value as any)?.siteDescription ?? '')
  const logo = computed(() => (settings.value as any)?.logo ?? '')
  const footerText = computed(() => String((settings.value as any)?.footerText ?? '').trim())
  const socialLinks = computed(() => (settings.value as any)?.socialLinks ?? {})

  const socialLinkItems = computed(() => {
    const s = socialLinks.value as Record<string, string>
    return socialPlatformDefs
      .map(d => ({
        ...d,
        url: String(s?.[d.key] ?? '').trim()
      }))
      .filter(d => d.url.length > 0)
  })

  return {
    settings,
    siteName,
    siteDescription,
    logo,
    footerText,
    socialLinks,
    socialLinkItems,
    refresh,
    status
  }
}
