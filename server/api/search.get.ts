export default defineEventHandler(async (event) => {
  const q = String(getQuery(event).q ?? '')
    .trim()
    .toLowerCase()
  if (q.length < 2) {
    return []
  }

  const sections = await queryCollectionSearchSections(event, 'content')
  const matches = sections.filter((s) => {
    const text = `${s.titles.join(' ')} ${s.title} ${s.content}`.toLowerCase()
    return text.includes(q)
  })

  return matches.slice(0, 35).map((s) => ({
    id: s.id,
    title:
      [...s.titles.filter(Boolean), s.title].filter(Boolean).join(' — ')
      || s.title
      || s.id,
    snippet: (s.content || '').replace(/\s+/g, ' ').trim().slice(0, 200),
  }))
})
