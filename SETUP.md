# Hướng dẫn Cài đặt & Khởi chạy Dự án DLMS

Dự án Digital Library Management System (DLMS) bao gồm Backend (FastAPI) và Frontend (React/Vite), được thiết kế để chạy toàn bộ qua Docker Compose một cách nhanh chóng.

## Yêu cầu

- [Docker](https://docs.docker.com/get-docker/) và Docker Compose cài đặt trên máy.

## Cài đặt và Khởi chạy (Sử dụng Docker)

Đây là cách dễ và khuyến khích nhất để khởi chạy hệ thống:

**1. Clone dự án về máy**
```bash
git clone <repository_url>
cd dlms
```

**2. Khởi động toàn bộ các dịch vụ bằng Docker Compose**
Tại thư mục gốc, chạy lệnh sau:
```bash
docker compose up -d
```
Hệ thống sẽ tự động build image và khởi động các thành phần:
- Backend: chạy tại `http://localhost:8000` (API Docs tại `http://localhost:8000/docs`)
- Frontend: chạy tại `http://localhost:5173`
- Database (PostgreSQL): chạy tại cổng `5432`

**3. Tắt dự án**
```bash
docker compose down
```

## Khởi chạy thủ công (Môi trường phát triển)

### Backend
1. Clone dự án và di chuyển vào `backend/`
2. Tạo Virtual Environment: `python -m venv .venv`
3. Kích hoạt môi trường và cài đặt dependencies: 
   ```bash
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
4. Copy `.env.example` thành `.env` và config thông số cần thiết (đặc biệt `DATABASE_URL`).
5. Chạy server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend
1. Di chuyển vào thư mục `frontend/`
2. Cài đặt các gói npm:
   ```bash
   npm install # hoặc yarn install
   ```
3. Chạy môi trường dev:
   ```bash
   npm run dev
   ```

## Workflow & Testing
Nếu bạn cần chạy Unit test hoặc Integration test:
1. Mở terminal vào thư mục `backend/`
2. Đảm bảo Database test/local đang chạy (Ví dụ đã `docker compose up -d`)
3. Chạy `pytest`:
   ```bash
   pytest tests/
   ```
*(Lưu ý: Nếu test báo lỗi `Event loop is closed` hoặc `Timeout`, hãy đảm bảo file `pytest.ini` của bạn có cấu hình scope session cho asyncio fixture)*
