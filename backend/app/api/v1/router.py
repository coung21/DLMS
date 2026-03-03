"""API v1 router – aggregates all endpoint routers."""
from fastapi import APIRouter

from app.api.v1.endpoints import auth

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])

# Thêm các router khác tại đây khi triển khai:
# from app.api.v1.endpoints import users, documents, categories, loans
# api_router.include_router(users.router, prefix="/users", tags=["Users"])
# api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
