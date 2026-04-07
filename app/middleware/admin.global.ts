export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) return

  const publicPaths = ['/admin/login', '/admin/register']
  const isPublic = publicPaths.includes(to.path)

  const { loggedIn, fetch } = useUserSession()
  await fetch()

  if (!isPublic && !loggedIn.value) {
    const q = to.fullPath !== '/admin' ? { redirect: to.fullPath } : {}
    return navigateTo({ path: '/admin/login', query: q })
  }

  if (isPublic && loggedIn.value) {
    return navigateTo('/admin')
  }
})
