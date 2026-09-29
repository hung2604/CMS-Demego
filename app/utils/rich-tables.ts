/**
 * Bọc mỗi <table> trong khung cuộn ngang (trang khách): table được kéo rộng hơn cột bài viết,
 * hoặc nhiều cột trên mobile, không bị cắt. HTML đầu vào đã được sanitize từ server
 * (chữ "<table" trong nội dung/thuộc tính đã bị escape nên chỉ khớp thẻ thật).
 */
export function wrapTablesForScroll (html: string): string {
  if (!html || !html.includes('<table')) return html
  return html
    .replace(/<table\b/gi, '<div class="post-table-scroll"><table')
    .replace(/<\/table>/gi, '</table></div>')
}
