from uuid import UUID
from app.domain.repositories.category_repository import ICategoryRepository
from app.domain.entities.category import Category
from app.application.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryListResponse


class GetCategoriesUseCase:
    def __init__(self, repository: ICategoryRepository):
        self._repository = repository

    async def execute(self) -> CategoryListResponse:
        categories = await self._repository.list_all()
        total = await self._repository.count_all()
        
        items = [
            CategoryResponse(
                id=c.id,
                name=c.name,
                description=c.description,
                created_at=c.created_at,
            )
            for c in categories
        ]
        
        return CategoryListResponse(items=items, total=total)


class CreateCategoryUseCase:
    def __init__(self, repository: ICategoryRepository):
        self._repository = repository

    async def execute(self, payload: CategoryCreate) -> CategoryResponse:
        # Check if name already exists
        existing = await self._repository.get_by_name(payload.name)
        if existing:
            raise ValueError(f"Category with name '{payload.name}' already exists.")

        category = Category(
            name=payload.name,
            description=payload.description,
        )
        created = await self._repository.create(category)
        
        return CategoryResponse(
            id=created.id,
            name=created.name,
            description=created.description,
            created_at=created.created_at,
        )


class UpdateCategoryUseCase:
    def __init__(self, repository: ICategoryRepository):
        self._repository = repository

    async def execute(self, category_id: UUID, payload: CategoryUpdate) -> CategoryResponse:
        category = await self._repository.get_by_id(category_id)
        if not category:
            raise ValueError(f"Category {category_id} not found")

        if payload.name is not None:
            # Check if new name exists elsewhere
            if payload.name != category.name:
                existing = await self._repository.get_by_name(payload.name)
                if existing:
                    raise ValueError(f"Category with name '{payload.name}' already exists.")
            category.name = payload.name
        
        if payload.description is not None:
            category.description = payload.description

        updated = await self._repository.update(category)
        
        return CategoryResponse(
            id=updated.id,
            name=updated.name,
            description=updated.description,
            created_at=updated.created_at,
        )


class DeleteCategoryUseCase:
    def __init__(self, repository: ICategoryRepository):
        self._repository = repository

    async def execute(self, category_id: UUID) -> None:
        category = await self._repository.get_by_id(category_id)
        if not category:
            raise ValueError(f"Category {category_id} not found")
            
        await self._repository.delete(category_id)
