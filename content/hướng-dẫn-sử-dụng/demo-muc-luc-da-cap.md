---
title: Demo mục lục đa cấp
description: Bài mẫu nhiều mục và mục con — để kiểm tra cây mục lục bên phải.
date: 2026-03-23
---

# Demo mục lục đa cấp

Đây là bài **thứ hai** dùng để xem TOC: có nhiều `##` và `###` lồng nhau. Bấm từng dòng trong mục lục để nhảy tới đúng đoạn.

## Phần mở đầu

Đoạn giới thiệu ngắn. Phần quan trọng nằm ở các mục sau.

### Mục tiêu bài viết

- Minh họa sidebar **Mục lục**
- Kiểm tra neo `#` tới heading

### Đối tượng đọc

Người chỉnh CMS, content writer, hoặc dev đang tùy biến giao diện.

## Nội dung trung tâm

Ở đây giả lập một bài hướng dẫn dài, chia thành nhiều block.

### Bước 1 — Chuẩn bị

Liệt kê việc cần làm trước khi viết hoặc publish.

### Bước 2 — Soạn thảo

Viết bằng Markdown thuần hoặc Nuxt Studio; heading chuẩn sẽ vào TOC.

### Bước 3 — Xuất bản

Commit / deploy theo quy trình repo của bạn.

## Phần nâng cao

Các mục con mô tả tình huống ít gặp hơn.

### Tùy chỉnh độ sâu TOC

Độ sâu heading lấy vào mục lục có thể cấu hình ở Nuxt Content / MDC (depth, searchDepth).

### Hiệu năng và SSR

Trang vẫn render server-side; mục lục lấy từ `body.toc` đã parse sẵn.

## Kết luận

Hai bài **`bai-mau`** và **`demo-muc-luc-da-cap`** đủ để thấy TOC **phẳng** và **nhiều cấp**. Quay lại [trang chủ](/) hoặc [bài mẫu kia](/blog/bai-mau) khi cần so sánh.
