import type { Db } from 'mongodb'
import { ObjectId } from 'mongodb'

export async function createChildMenuForPost (
  db: Db,
  args: {
    postId: string
    parentMenuId: string
    title: { vi: string; en: string }
    slug: string
  }
) {
  const { postId, parentMenuId, title, slug } = args
  if (!ObjectId.isValid(parentMenuId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid parent menu id' })
  }
  const parent = await db.collection('menus').findOne({ _id: new ObjectId(parentMenuId) })
  if (!parent) throw createError({ statusCode: 400, statusMessage: 'Parent menu not found' })

  const siblings = await db.collection('menus').find({ parentId: parentMenuId }).toArray()
  let maxOrder = 0
  for (const s of siblings) maxOrder = Math.max(maxOrder, Number(s.order) || 0)
  const order = maxOrder + 1

  const now = new Date()
  const ins = await db.collection('menus').insertOne({
    title: { vi: title.vi.trim(), en: title.en.trim() },
    slug: slug.trim() || 'untitled',
    icon: '',
    parentId: parentMenuId,
    order,
    postId,
    createdAt: now,
    updatedAt: now
  })

  const childId = ins.insertedId.toString()
  await db.collection('posts').updateOne(
    { _id: new ObjectId(postId) },
    { $set: { menuId: childId, updatedAt: new Date() } }
  )
}

/**
 * Đổi cha của mục menu gắn với bài, hoặc tạo mục con mới nếu bài chưa có menuId.
 */
export async function applyMenuParentForPost (
  db: Db,
  postId: string,
  parentMenuId: string | null
) {
  if (!ObjectId.isValid(postId)) return

  const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) })
  if (!post) return

  const rawMenu = post.menuId as string | ObjectId | null | undefined
  const existingMenuId =
    rawMenu != null && String(rawMenu).trim() !== '' ? String(rawMenu) : null

  if (parentMenuId) {
    if (!ObjectId.isValid(parentMenuId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid parent menu id' })
    }
    const pMenu = await db.collection('menus').findOne({ _id: new ObjectId(parentMenuId) })
    if (!pMenu) throw createError({ statusCode: 400, statusMessage: 'Parent menu not found' })
  }

  if (existingMenuId) {
    if (parentMenuId === existingMenuId) {
      throw createError({ statusCode: 400, statusMessage: 'Menu cannot be its own parent' })
    }
    await db.collection('menus').updateOne(
      { _id: new ObjectId(existingMenuId) },
      { $set: { parentId: parentMenuId, updatedAt: new Date() } }
    )
    return
  }

  if (parentMenuId) {
    const title = post.title as { vi?: string; en?: string } | undefined
    const slugObj = post.slug as { vi?: string } | undefined
    await createChildMenuForPost(db, {
      postId,
      parentMenuId,
      title: { vi: title?.vi ?? '', en: title?.en ?? '' },
      slug: slugObj?.vi ?? 'untitled'
    })
  }
}
