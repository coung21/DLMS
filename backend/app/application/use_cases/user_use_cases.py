from uuid import UUID
from app.domain.repositories.user_repository import IUserRepository
from app.application.schemas.auth import UserResponse, UserListResponse, UserUpdate

class GetUsersUseCase:
    def __init__(self, repository: IUserRepository):
        self._repository = repository

    async def execute(self, skip: int = 0, limit: int = 20) -> UserListResponse:
        users = await self._repository.list_all(skip=skip, limit=limit)
        total = await self._repository.count_all()
        
        items = [
            UserResponse(
                id=u.id,
                email=u.email,
                full_name=u.full_name,
                role=u.role,
                status=u.status,
                created_at=u.created_at,
            )
            for u in users
        ]
        
        return UserListResponse(
            items=items,
            total=total,
            skip=skip,
            limit=limit,
        )

class UpdateUserUseCase:
    def __init__(self, repository: IUserRepository):
        self._repository = repository

    async def execute(self, user_id: UUID, payload: UserUpdate) -> UserResponse:
        user = await self._repository.get_by_id(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")

        if payload.full_name is not None:
            user.full_name = payload.full_name
        if payload.status is not None:
            user.status = payload.status
        if payload.role is not None:
            user.role = payload.role

        updated_user = await self._repository.update(user)
        return UserResponse(
            id=updated_user.id,
            email=updated_user.email,
            full_name=updated_user.full_name,
            role=updated_user.role,
            status=updated_user.status,
            created_at=updated_user.created_at,
        )
