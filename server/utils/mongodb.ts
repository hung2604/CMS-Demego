import { MongoClient, type Db } from 'mongodb'

declare global {
  var __mongoClient: MongoClient | undefined
}

export async function useMongoDb (): Promise<Db> {
  const { mongodbUri, mongodbDb } = useRuntimeConfig()

  if (!mongodbUri) {
    throw new Error('Thiếu MONGODB_URI trong biến môi trường')
  }

  if (!globalThis.__mongoClient) {
    globalThis.__mongoClient = new MongoClient(mongodbUri)
    await globalThis.__mongoClient.connect()
  }

  return globalThis.__mongoClient.db(mongodbDb)
}
