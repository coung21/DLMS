"""API v1 router – aggregates all endpoint routers."""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, documents

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(documents.router)
