import type { H3Event } from 'h3'

/** Phiên admin (cookie). Mở rộng sau nếu cần kiểm tra role. */
export async function requireAuthSession (event: H3Event) {
  await requireUserSession(event)
}
