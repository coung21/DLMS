"""Auth endpoints – login, logout, refresh token."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.schemas import LoginRequest, TokenResponse, RefreshTokenRequest
from app.infrastructure.database.session import get_db

router = APIRouter()


@router.post("/login", response_model=TokenResponse, summary="Đăng nhập")
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    # TODO: inject AuthUseCase via DI
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")


@router.post("/refresh", response_model=TokenResponse, summary="Làm mới access token")
async def refresh_token(payload: RefreshTokenRequest):
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")


@router.post("/logout", status_code=204, summary="Đăng xuất")
async def logout():
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")
