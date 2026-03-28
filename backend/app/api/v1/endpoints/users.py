from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.application.schemas import UserResponse, UserUpdate, UserListResponse
from app.infrastructure.database.session import get_db
from app.infrastructure.repositories.user_repository import UserRepository
from app.application.use_cases.user_use_cases import GetUsersUseCase, UpdateUserUseCase
from app.api.v1.dependencies.auth import get_current_user_id, require_roles
from app.domain.enums import UserRole

router = APIRouter()

@router.get("/me", response_model=UserResponse, summary="Lấy thông tin cá nhân")
async def get_me(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        status=user.status,
        created_at=user.created_at,
    )


@router.get("", response_model=UserListResponse, summary="Liệt kê danh sách người dùng (Admin)")
async def list_users(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_roles(UserRole.ADMIN)),
):
    repo = UserRepository(db)
    use_case = GetUsersUseCase(repo)
    return await use_case.execute(skip=skip, limit=limit)


@router.patch("/{user_id}", response_model=UserResponse, summary="Cập nhật người dùng (Admin)")
async def update_user(
    user_id: UUID,
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_roles(UserRole.ADMIN)),
):
    repo = UserRepository(db)
    use_case = UpdateUserUseCase(repo)
    try:
        return await use_case.execute(user_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
