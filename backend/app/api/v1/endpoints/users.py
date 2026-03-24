from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.application.schemas import UserResponse
from app.infrastructure.database.session import get_db
from app.infrastructure.repositories.user_repository import UserRepository
from app.api.v1.dependencies.auth import get_current_user_id

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
