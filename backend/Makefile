.PHONY: migrate upgrade downgrade history current

# Tạo migration mới:  make migrate msg="add_column_x"
migrate:
	PYTHONPATH=. alembic revision --autogenerate -m "$(msg)"

# Chạy tất cả migrations lên latest
upgrade:
	PYTHONPATH=. alembic upgrade head

# Rollback 1 bước
downgrade:
	PYTHONPATH=. alembic downgrade -1

# Xem lịch sử migration
history:
	PYTHONPATH=. alembic history --verbose

# Xem revision hiện tại của DB
current:
	PYTHONPATH=. alembic current
