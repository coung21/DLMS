from uuid import UUID
from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.category import Category
from app.domain.repositories.category_repository import ICategoryRepository
from app.infrastructure.database.models import CategoryModel


def _to_entity(model: CategoryModel) -> Category:
    return Category(
        id=model.id,
        name=model.name,
        description=model.description,
        created_at=model.created_at,
    )


class CategoryRepository(ICategoryRepository):
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_id(self, category_id: UUID) -> Optional[Category]:
        result = await self._db.execute(
            select(CategoryModel).where(CategoryModel.id == category_id)
        )
        model = result.scalar_one_or_none()
        return _to_entity(model) if model else None

    async def get_by_name(self, name: str) -> Optional[Category]:
        result = await self._db.execute(
            select(CategoryModel).where(CategoryModel.name == name)
        )
        model = result.scalar_one_or_none()
        return _to_entity(model) if model else None

    async def create(self, category: Category) -> Category:
        model = CategoryModel(
            id=category.id,
            name=category.name,
            description=category.description,
            created_at=category.created_at,
        )
        self._db.add(model)
        await self._db.flush()
        await self._db.refresh(model)
        return _to_entity(model)

    async def update(self, category: Category) -> Category:
        model = await self._db.get(CategoryModel, category.id)
        if not model:
            raise ValueError(f"Category {category.id} not found")
        model.name = category.name
        model.description = category.description
        await self._db.flush()
        await self._db.refresh(model)
        return _to_entity(model)

    async def delete(self, category_id: UUID) -> None:
        model = await self._db.get(CategoryModel, category_id)
        if model:
            await self._db.delete(model)
            await self._db.flush()

    async def list_all(self, skip: int = 0, limit: int = 100) -> List[Category]:
        result = await self._db.execute(
            select(CategoryModel).offset(skip).limit(limit)
        )
        return [_to_entity(m) for m in result.scalars().all()]

    async def count_all(self) -> int:
        result = await self._db.execute(select(func.count(CategoryModel.id)))
        return result.scalar() or 0
