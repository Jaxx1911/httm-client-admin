# Legacy Sample Manager

Đây là trang quản lý samples độc lập, được tích hợp vào project Next.js nhưng vẫn giữ nguyên cấu trúc HTML ban đầu.

## Truy cập

- URL: `http://localhost:3000/legacy-admin/index.html`
- Hoặc click vào "Sample Manager" trong sidebar

## Lưu ý

- Trang này hoạt động độc lập với React + Babel standalone
- Không sử dụng các component của Next.js
- API calls được tự động proxy đến backend server (localhost:8000)

## Backend Server

Đảm bảo backend server đang chạy tại `http://localhost:8000`

Nếu backend server chạy ở port khác, hãy cập nhật trong file `next.config.mjs`
