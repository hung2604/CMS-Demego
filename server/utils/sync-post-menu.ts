import type { Db } from 'mongodb'
import { ObjectId } from 'mongodb'

/**
 * Đồng bộ hai chiều: `posts.menuId` ↔ `menus.postId`.
 * Gọi sau khi post đã được ghi (insert/update) với trường menuId đúng như mong muốn.
 */
export async function syncMenusForPost (db: Db, postId: string) {
  if (!ObjectId.isValid(postId)) return

  const oid = new ObjectId(postId)
  const post = await db.collection('posts').findOne({ _id: oid })
  if (!post) return

  const rawMenu = post.menuId as string | ObjectId | null | undefined
  const menuId =
    rawMenu != null && String(rawMenu).trim() !== '' ? String(rawMenu) : null

  await db.collection('menus').updateMany(
    { postId },
    { $set: { postId: null, updatedAt: new Date() } }
  )

  if (!menuId || !ObjectId.isValid(menuId)) {
    if (menuId && !ObjectId.isValid(menuId)) {
      await db.collection('posts').updateOne(
        { _id: oid },
        { $set: { menuId: null, updatedAt: new Date() } }
      )
    }
    return
  }

  const menuOid = new ObjectId(menuId)
  const menu = await db.collection('menus').findOne({ _id: menuOid })
  if (!menu) {
    await db.collection('posts').updateOne(
      { _id: oid },
      { $set: { menuId: null, updatedAt: new Date() } }
    )
    return
  }

  const otherPostId = menu.postId != null ? String(menu.postId) : null
  if (otherPostId && otherPostId !== postId) {
    await db.collection('posts').updateOne(
      { _id: new ObjectId(otherPostId) },
      { $set: { menuId: null, updatedAt: new Date() } }
    )
  }

  await db.collection('menus').updateOne(
    { _id: menuOid },
    { $set: { postId, updatedAt: new Date() } }
  )
}
