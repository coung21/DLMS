"""Auth endpoints – register, login, logout, refresh token."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.schemas import LoginRequest, RegisterRequest, TokenResponse, RefreshTokenRequest, UserResponse
from app.application.use_cases.auth_use_case import AuthUseCase
from app.core.exceptions import DuplicateEntityError
from app.infrastructure.database.session import get_db
from app.infrastructure.repositories.user_repository import UserRepository

router = APIRouter()


def get_auth_use_case(db: AsyncSession = Depends(get_db)) -> AuthUseCase:
    return AuthUseCase(user_repo=UserRepository(db))


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Đăng ký tài khoản",
)
async def register(
    payload: RegisterRequest,
    use_case: AuthUseCase = Depends(get_auth_use_case),
):
    try:
        return await use_case.register(payload)
    except DuplicateEntityError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)


@router.post("/login", response_model=TokenResponse, summary="Đăng nhập")
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    # TODO: implement LoginUseCase
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")


@router.post("/refresh", response_model=TokenResponse, summary="Làm mới access token")
async def refresh_token(payload: RefreshTokenRequest):
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")


@router.post("/logout", status_code=204, summary="Đăng xuất")
async def logout():
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")
