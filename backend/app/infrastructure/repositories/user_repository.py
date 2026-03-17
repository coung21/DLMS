"""SQLAlchemy implementation of IUserRepository."""
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.user import User
from app.domain.enums import UserRole, UserStatus
from app.domain.repositories.user_repository import IUserRepository
from app.infrastructure.database.models import UserModel


def _to_entity(model: UserModel) -> User:
    return User(
        id=model.id,
        email=model.email,
        hashed_password=model.hashed_password,
        full_name=model.full_name,
        role=UserRole(model.role.name) if model.role else UserRole.MEMBER,
        status=UserStatus.ACTIVE if model.is_active else UserStatus.INACTIVE,
        created_at=model.created_at,
    )


class UserRepository(IUserRepository):
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_id(self, user_id: UUID) -> User | None:
        result = await self._db.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        model = result.scalar_one_or_none()
        return _to_entity(model) if model else None

    async def get_by_email(self, email: str) -> User | None:
        result = await self._db.execute(
            select(UserModel).where(UserModel.email == email)
        )
        model = result.scalar_one_or_none()
        return _to_entity(model) if model else None

    async def create(self, user: User) -> User:
        model = UserModel(
            id=user.id,
            email=user.email,
            hashed_password=user.hashed_password,
            full_name=user.full_name,
            is_active=(user.status == UserStatus.ACTIVE),
        )
        self._db.add(model)
        await self._db.flush()
        await self._db.refresh(model)
        return _to_entity(model)

    async def update(self, user: User) -> User:
        model = await self._db.get(UserModel, user.id)
        if not model:
            raise ValueError(f"User {user.id} not found")
        model.full_name = user.full_name
        model.is_active = user.status == UserStatus.ACTIVE
        await self._db.flush()
        await self._db.refresh(model)
        return _to_entity(model)

    async def delete(self, user_id: UUID) -> None:
        model = await self._db.get(UserModel, user_id)
        if model:
            await self._db.delete(model)
            await self._db.flush()

    async def list_all(self, skip: int = 0, limit: int = 20) -> list[User]:
        result = await self._db.execute(
            select(UserModel).offset(skip).limit(limit)
        )
        return [_to_entity(m) for m in result.scalars().all()]
