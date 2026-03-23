.PHONY: up down restart logs \
        build build-backend build-frontend \
        dev-restart dev-restart-backend

# ─── Quản lý toàn bộ stack ────────────────────────────────────────────
## Khởi động tất cả services (lần đầu hoặc sau khi đã build)
up:
	docker compose up -d

## Tắt tất cả services
down:
	docker compose down

## Xem logs realtime (Ctrl+C để thoát)
logs:
	docker compose logs -f

## Logs của từng service
logs-be:
	docker compose logs -f backend

logs-fe:
	docker compose logs -f frontend

logs-db:
	docker compose logs -f postgres

# ─── Build lại image khi code xong ────────────────────────────────────
## Build lại image backend và restart (dùng sau khi sửa code backend)
dev-restart-backend:
	docker compose build backend
	docker compose up -d --no-deps backend
	docker compose logs -f backend

## Build lại image frontend và restart
dev-restart-frontend:
	docker compose build frontend
	docker compose up -d --no-deps frontend
	docker compose logs -f frontend

## Build lại TẤT CẢ image và restart toàn bộ stack
rebuild:
	docker compose build
	docker compose up -d
