from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.application.schemas import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryListResponse
from app.infrastructure.database.session import get_db
from app.infrastructure.repositories.category_repository import CategoryRepository
from app.application.use_cases.category_use_cases import (
    GetCategoriesUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
)
from app.api.v1.dependencies.auth import require_roles
from app.domain.enums import UserRole

router = APIRouter()


@router.get("", response_model=CategoryListResponse, summary="Liệt kê danh mục")
async def list_categories(
    db: AsyncSession = Depends(get_db),
):
    repo = CategoryRepository(db)
    use_case = GetCategoriesUseCase(repo)
    return await use_case.execute()


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED, summary="Tạo danh mục mới (Admin)")
async def create_category(
    payload: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_roles(UserRole.ADMIN)),
):
    repo = CategoryRepository(db)
    use_case = CreateCategoryUseCase(repo)
    try:
        return await use_case.execute(payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/{category_id}", response_model=CategoryResponse, summary="Cập nhật danh mục (Admin)")
async def update_category(
    category_id: UUID,
    payload: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_roles(UserRole.ADMIN)),
):
    repo = CategoryRepository(db)
    use_case = UpdateCategoryUseCase(repo)
    try:
        return await use_case.execute(category_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Xóa danh mục (Admin)")
async def delete_category(
    category_id: UUID,
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_roles(UserRole.ADMIN)),
):
    repo = CategoryRepository(db)
    use_case = DeleteCategoryUseCase(repo)
    try:
        await use_case.execute(category_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
