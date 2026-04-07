export function usePosts(options?: {
  page?: Ref<number>
  limit?: number
  search?: Ref<string>
  status?: string
}) {
  const page = options?.page ?? ref(1)
  const limit = options?.limit ?? 10
  const search = options?.search ?? ref('')
  const filterStatus = options?.status

  const { data, refresh, status: fetchStatus } = useFetch('/api/posts', {
    key: `posts-${filterStatus ?? 'all'}`,
    query: computed(() => ({
      page: page.value,
      limit,
      search: search.value || undefined,
      status: filterStatus || undefined
    }))
  })

  const posts = computed(() => (data.value as any)?.posts ?? [])
  const total = computed(() => (data.value as any)?.total ?? 0)
  const totalPages = computed(() => Math.ceil(total.value / limit))

  return {
    posts,
    total,
    totalPages,
    page,
    search,
    refresh,
    fetchStatus
  }
}
