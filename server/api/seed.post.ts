import type { Db } from 'mongodb'
import type { SeedMenuBranch } from '../utils/seed-cms'
import { getSeedMenuTree } from '../utils/seed-cms'
import { sanitizePostContent } from '../utils/sanitize'
import { upsertSeedUsers } from '../utils/seed-users'

interface SeedBody {
  wipe?: boolean
  /** Xóa collection users trước khi upsert user seed (tuỳ chọn, tách khỏi wipe nội dung) */
  wipeUsers?: boolean
  token?: string
}

function assertSeedAllowed (body: SeedBody) {
  const rt = useRuntimeConfig()
  const token = rt.seedToken as string | undefined
  const isProd = process.env.NODE_ENV === 'production'

  if (isProd) {
    if (!token || body.token !== token) {
      throw createError({ statusCode: 403, statusMessage: 'Seed chỉ bật trên production khi SEED_TOKEN khớp trong body { token }' })
    }
  }
}

async function insertBranch (db: Db, branch: SeedMenuBranch, parentId: string | null) {
  const now = new Date()

  const menuResult = await db.collection('menus').insertOne({
    title: { vi: branch.title, en: branch.titleEn ?? branch.title },
    slug: branch.slug,
    icon: branch.icon,
    parentId,
    order: branch.order,
    postId: null,
    createdAt: now,
    updatedAt: now
  })
  const menuId = menuResult.insertedId.toString()

  const p = branch.post
  const postDoc = sanitizePostContent({
    title: { vi: p.titleVi, en: p.titleEn },
    slug: { vi: p.slugVi, en: p.slugEn },
    content: { vi: p.contentVi, en: p.contentEn },
    excerpt: { vi: p.excerptVi, en: p.excerptEn },
    status: p.status,
    menuId,
    seo: {
      vi: p.seoVi,
      en: p.seoEn
    }
  })

  const postResult = await db.collection('posts').insertOne({
    ...postDoc,
    createdAt: now,
    updatedAt: now
  })
  const postId = postResult.insertedId.toString()

  await db.collection('menus').updateOne(
    { _id: menuResult.insertedId },
    { $set: { postId, updatedAt: new Date() } }
  )

  let menuCount = 1
  let postCount = 1
  if (branch.children?.length) {
    for (const ch of branch.children) {
      const sub = await insertBranch(db, ch, menuId)
      menuCount += sub.menuCount
      postCount += sub.postCount
    }
  }
  return { menuCount, postCount }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SeedBody>(event).catch(() => ({} as SeedBody))
  assertSeedAllowed(body)

  const db = await useMongoDb()

  if (body.wipeUsers) {
    await db.collection('users').deleteMany({})
  }

  if (body.wipe) {
    await db.collection('posts').deleteMany({})
    await db.collection('menus').deleteMany({})
  }

  let menuCount = 0
  let postCount = 0
  const tree = getSeedMenuTree()
  for (const root of tree) {
    const r = await insertBranch(db, root, null)
    menuCount += r.menuCount
    postCount += r.postCount
  }

  const { inserted: usersInserted } = await upsertSeedUsers(db)

  return {
    ok: true,
    wipe: !!body.wipe,
    wipeUsers: !!body.wipeUsers,
    menuCount,
    postCount,
    usersInserted,
    message: 'Đã seed menu, bài viết và user mẫu. wipeUsers: true để xóa users trước khi seed; wipe: true để xóa posts/menus.'
  }
})
