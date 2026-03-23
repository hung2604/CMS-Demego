export function useSearchModal() {
  const isOpen = useState('search-modal-open', () => false)
  const seedQuery = useState('search-modal-seed', () => '')

  function open(query = '') {
    seedQuery.value = query
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    seedQuery.value = ''
  }

  return { isOpen, seedQuery, open, close }
}
