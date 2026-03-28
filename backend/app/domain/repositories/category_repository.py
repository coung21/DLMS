from abc import ABC, abstractmethod
from uuid import UUID
from typing import List, Optional
from app.domain.entities.category import Category


class ICategoryRepository(ABC):
    @abstractmethod
    async def get_by_id(self, category_id: UUID) -> Optional[Category]:
        pass

    @abstractmethod
    async def get_by_name(self, name: str) -> Optional[Category]:
        pass

    @abstractmethod
    async def create(self, category: Category) -> Category:
        pass

    @abstractmethod
    async def update(self, category: Category) -> Category:
        pass

    @abstractmethod
    async def delete(self, category_id: UUID) -> None:
        pass

    @abstractmethod
    async def list_all(self) -> List[Category]:
        pass

    @abstractmethod
    async def count_all(self) -> int:
        pass
