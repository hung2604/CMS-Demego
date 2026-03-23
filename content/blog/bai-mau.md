---
title: Bài blog mẫu
description: Ví dụ nội dung trong thư mục blog — có nhiều mục để thử mục lục bên phải.
date: 2026-03-23
---

# Bài blog mẫu

File này nằm tại `content/blog/bai-mau.md`, URL trên site là **`/blog/bai-mau`**. Cuộn trang và xem cột **Mục lục** (xl): các link bám theo heading bên dưới.

## Bắt đầu nhanh

Chạy `npm run dev`, mở Studio nếu cần chỉnh trực quan. Mỗi file `.md` trong `content/` tương ứng một route.

### Cấu trúc thư mục

- `content/blog/*.md` — bài viết
- `content/docs/*.md` — tài liệu dài hơn

### Front matter

Phần `---` đầu file dùng cho `title`, `description`, `date` — hiển thị SEO và danh sách.

## Viết nội dung có mục lục

Mục lục tự lấy từ **heading** trong Markdown (`##`, `###`, …). Càng nhiều cấp hợp lệ, cây bên phải càng rõ.

### Gợi ý cho tác giả

- Mỗi phần lớn nên có một `##`
- Chia nhỏ bằng `###` khi đoạn dài
- Tránh nhảy cấp tùy tiện (ví dụ `##` rồi `#####`) nếu muốn TOC dễ đọc

## Hình ảnh và liên kết

![image](/Anh-man-hinh-2026-03-05-luc-13.23.53-removebg-preview-fotor-bg-remover-20260305133134.png)

[← Trang chủ](/) · [Giới thiệu](/about) · [Bài demo mục lục đa cấp](/blog/demo-muc-luc-da-cap)

## Tóm tắt

Bạn có **cấu trúc phẳng** (chỉ `##`) hoặc **nhiều tầng** (`##` + `###`) — sidebar sẽ phản ánh đúng phần đang có trong bài.
