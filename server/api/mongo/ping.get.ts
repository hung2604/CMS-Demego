export default defineEventHandler(async () => {
  const db = await useMongoDb()
  const ping = await db.command({ ping: 1 })

  return {
    ok: ping.ok === 1,
    database: db.databaseName
  }
})
