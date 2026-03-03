# ── Stage 1: builder ──────────────────────────────────────
FROM python:3.13-slim AS builder

WORKDIR /app

# Cài dependencies vào prefix riêng để copy sang stage sau
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --prefix=/install --no-cache-dir -r requirements.txt


# ── Stage 2: runtime ──────────────────────────────────────
FROM python:3.13-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Copy installed packages từ builder
COPY --from=builder /install /usr/local

# Copy source code
COPY app/ ./app/
COPY alembic.ini .

# Tạo user non-root để chạy app, và cấp quyền cho thư mục logs
RUN addgroup --system dlms && adduser --system --ingroup dlms dlms \
    && mkdir -p logs \
    && chown -R dlms:dlms /app
USER dlms

EXPOSE 8000

# Chạy migration rồi start server
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
