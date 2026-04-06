# Báo cáo Bài tập nhóm

## 1. Tên đề tài, danh sách nhóm
- **Tên đề tài:** Phân tích, thiết kế và xây dựng Hệ thống Quản lý Tài liệu Giảng dạy & Học tập (Document Lifecycle Management System - DLMS)
- **Danh sách nhóm:**
  1. [Họ và tên thành viên 1] - [Mã sinh viên 1] - [Vai trò: Nhóm trưởng, Backend Developer, DevOps...]
  2. [Họ và tên thành viên 2] - [Mã sinh viên 2] - [Vai trò: Frontend Developer, UI/UX Design...]
  3. [Họ và tên thành viên 3] - [Mã sinh viên 3] - [Vai trò: Tester, Database Admin...]

---

## 2. Requirements

### 2.1. Mô tả tổng quan về đề tài
- **Mục đích đề tài giải quyết các vấn đề gì? (Use case):** 
  - Giải quyết tình trạng phân tán trong lưu trữ và phân phối tài liệu học tập, giáo trình, bài giảng giữa giảng viên và sinh viên.
  - Cung cấp một quy trình kiểm duyệt tài liệu (Document Review Workflow) minh bạch để đảm bảo chất lượng tài nguyên học liệu trước khi phát hành cho người học.
  - Tối ưu hóa việc tra cứu tài liệu với hệ thống phân loại danh mục, công cụ tìm kiếm chuẩn xác và các luồng cấp quyền truy cập qua signed URLs của hệ thống Cloud Storage nội bộ.
- **Ai sử dụng? (Actors):**
  - **Student (Sinh viên):** Tìm kiếm, xem trước (preview) và tải xuống các tài liệu đã được Approved. Đăng ký tài khoản thành công sẽ tự động kích hoạt (Auto-activation).
  - **Teacher (Giảng viên):** Tải lên các tài nguyên học tập, quản lý kho tài liệu cá nhân. Tài khoản Teacher khi đăng ký cần sự phê duyệt thủ công từ Admin để đảm bảo tính xác thực.
  - **Admin (Quản trị viên):** Phê duyệt tài khoản Teacher; kiểm duyệt duyệt/từ chối tài liệu được tải lên; quản lý danh mục và cấu hình toàn hệ thống.
- **Phạm vi ứng dụng:** 
  - Hệ thống dành cho các môi trường giáo dục: Trường Đại học, Cao đẳng hoặc Trung tâm đào tạo nhằm tin học hóa quy trình chia sẻ tài liệu số một cách an toàn và có tổ chức.

### 2.2. Yêu cầu chức năng
1. **Xác thực và Phân quyền (RBAC - Role Based Access Control):** 
   - Đăng nhập, đăng ký theo quyền. Quản lý trạng thái tài khoản (Active, Inactive, Pending Approval).
2. **Quản lý Tài liệu (Document Management):** 
   - Nền tảng tải file lớn (MinIO Integration), giới hạn định dạng và kiểm soát metadata (người đăng tải, danh mục...).
3. **Quy trình kiểm duyệt (Review Workflow):** 
   - Duyệt tài liệu nhiều bước. Chuyển đổi trạng thái tài liệu: Hóa nháp -> Chờ Duyệt (Pending) -> Đã duyệt (Approved) / Bị từ chối (Rejected).
4. **Tìm kiếm và Phân trang:** 
   - Danh sách tài liệu trang chủ xử lý khối lượng lớn bằng thuật toán phân trang (Pagination).
   - Tìm kiếm theo từ khóa (Search Document) mượt mà, phản hồi ngay lập tức.
5. **Hỗ trợ bản địa hóa (Localization):**
   - Hỗ trợ giao diện 100% tiếng Việt cho các role (Admin/Teacher/Student Dashboard) thân thiện với người dùng.

### 2.3. Yêu cầu phi chức năng
1. **Bảo mật:**
   - Mã hóa mật khẩu (Bcrypt), định danh bằng OAuth2/JWT.
   - Tài liệu học tập không cho phép truy cập public, chỉ được quyền tải/preview thông qua link chia sẻ mã hóa (Presigned URLs) giới hạn thời gian sinh ra từ MinIO.
2. **Hiệu năng:** 
   - API bất đồng bộ (Async) giúp hệ thống xử lý được hàng trăm request tải file đồng thời mà không nghẽn.
3. **Mở rộng (Scalability) & Triển khai:**
   - Kiến trúc module. Hoạt động trên môi trường Docker container hoàn toàn tách biệt.

### 2.4. Yêu cầu hệ thống
- **Frontend:** React, Vite, thư viện UI Components (Tailwind CSS, Material UI) đảm bảo giao diện đồ họa hiện đại.
- **Backend:** Python + FastAPI framework, SQLAlchemy ORM (quản lý cơ sở dữ liệu), Alembic (Migration dữ liệu).
- **Hệ cơ sở dữ liệu:** PostgreSQL (Dữ liệu cấu trúc) và MinIO (Dữ liệu phi cấu trúc vật lý kiểu AWS S3 Object Storage). 
- **Công cụ:** Git, Docker/Docker-compose.

---

## 3. Phân tích

### 3.1. Biểu đồ chức năng (Use Case)
*(Các nhóm cần bổ sung hình và vẽ chi tiết ra các hình vẽ UML)*
- **Cụm Use Case Quản trị User:** Đăng ký, Đăng nhập, Quản trị viên duyệt hồ sơ Giảng viên.
- **Cụm Use Case Quản trị Tài Liệu:** Giảng viên Upload document; Admin duyệt document.
- **Cụm Use Case Tiêu thụ nội dung:** Sinh viên/Giảng viên xem danh sách document, Phân trang danh sách, Search document, Sinh Presigned Url để download.
  
*(Chèn hình Use Case Diagram tổng quát tại đây)*

### 3.2. Mô hình dữ liệu logic, Class Diagram
**Một số Entity/Table chính của hệ thống bao gồm:**
- `User`: Chứa thông tin đăng nhập, mật khẩu mã hoá, Role (ADMIN, TEACHER, STUDENT), Status.
- `Category`: Danh mục lưu trữ phân loại tài liệu (Ngành học, Môn học).
- `Document`: Chứa metadata về file như `title`, `description`, `file_url`, `status_review`, `uploader_id`.
- `DocumentReview`: Ghi nhận lịch sử kiểm duyệt (ai duyệt, thời gian, nhận xét).

*(Chèn hình Class Diagram hoặc ERD tại đây)*

---

## 4. Xây dựng hệ thống

### 4.1. Qui trình Scrum
*(Tuỳ chỉnh các hạng mục dưới đây theo thực tế chia task của nhóm)*

#### i. Product Backlog
- Thiết lập Backend Core, DB Connection, Docker hóa.
- Phân quyền RBAC, Login/Register JWT (Luồng duyệt tài khoản giáo viên).
- Cài đặt MinIO Server, tích hợp upload Object storage.
- Chức năng Upload/Review Document.
- Phân trang, Search trên Homepage bằng frontend React.
- Cấu hình Localization Frontend tiếng Việt toàn bộ app.

#### ii. Sprint’s Backlogs & Releases
- **Sprint 1 (Architecture & Auth):** Dựng khung FastAPI & Vite; Dựng DB PostgreSQL & Docker-compose; Triển khai xong chức năng Login, Phân quyền JWT RBAC.
- **Sprint 2 (Core Business):** Tích hợp thành công server MinIO; Fix lỗi Healthcheck; Tạo API Upload Document (Presigned url); Hoàn thiện Module Teacher Dashboard để tải file lên.
- **Sprint 3 (Review & Front-end Integration):** Làm tính năng Document Review workflow; Làm trang chủ Pagination, hệ thống Search; Việt hoá hệ thống bằng React I18n/Context; Fix các lỗi merge branch Git.
- **Release:** Ra mắt phiên bản MVP, chạy trơn tru đa vùng trên 1 docker-compose stack.

### 4.2. Viết báo cáo
#### i. Tổng kết các sprints 
- **Sprint 1:** Cấu trúc được backend rõ ràng giúp nhóm mở rộng dễ dàng (dựa theo Repository Pattern). Khó khăn gặp phải: Docker Container liên kết với nhau qua network bridge gặp issue mạng nội bộ.
- **Sprint 2:** Đã giải quyết được `SignatureDoesNotMatch` của Minio khi gen presigned URLs nội bộ vs bên ngoài browser. Giảng viên đã upload thành công.
- **Sprint 3:** Merge tính năng search pagination thành công; Xử lý triệt để hiển thị tiếng Việt trên UI, dọn dẹp các Dependency thừa bằng npm audit fix.

#### ii. Biểu đồ sprint’s burn-down
*(Chèn hình biểu đồ tiến độ / Trello / Jira screenshot tại đây)*

---

## 5. UI Design + Implementation
- **UI Design & Mockups:** Giao diện được thiết kế xoay quanh tính đơn giản và trực quan. Sử dụng Navbar điều hướng, với không gian Dashboard rộng để Giáo viên quản lý File upload, Admin có trang Admin Board riêng duyệt file nhanh gọn.
- **Implementation:** 
  - Phần Core Frontend dùng React Component kết hợp Vite để hot-reload nhanh.
  - Sử dụng TailwindCSS giúp responsive trên cả Table/Mobile tại trang danh sách.
  - Quản lý State bằng Context API / Redux và query dữ liệu từ backend bằng Axios interceptors (tự động gắn token).
  *(Chèn các hình ảnh screenshot thực tế của trang Đăng nhập, Trang Upload Teacher, Trang chủ)*

---

## 6. Result & URL
- **Kết quả đạt được:** Hệ thống hoàn thành 100% các chức năng cốt lõi. Chạy stable thông qua 1 file docker-compose up. Luồng duyệt file khép kín và an toàn bảo mật. Giao diện trực quan tiếng Việt trơn tru.
- **URL Source code (GitHub / GitLab):** [Điền link code Backend / Frontend của bạn vào đây]
- **URL Deploy:** [Điền link host server nếu nhóm đã deploy (Vercel/Render/VPS...)]
- **URL Tài liệu Khác:** [Link Postman API Collection, Trello Board...]
