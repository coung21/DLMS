"""Auth use cases: register, login, refresh."""
from app.application.schemas import RegisterRequest, UserResponse
from app.core.exceptions import DuplicateEntityError
from app.domain.entities.user import User
from app.domain.repositories.user_repository import IUserRepository
from app.infrastructure.security.jwt import hash_password


class AuthUseCase:
    def __init__(self, user_repo: IUserRepository) -> None:
        self._user_repo = user_repo

    async def register(self, data: RegisterRequest) -> UserResponse:
        """Tạo tài khoản mới. Raise DuplicateEntityError nếu email đã tồn tại."""
        existing = await self._user_repo.get_by_email(data.email)
        if existing:
            raise DuplicateEntityError(f"Email '{data.email}' đã được đăng ký.")

        user = User(
            email=data.email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
        )
        created = await self._user_repo.create(user)

        return UserResponse(
            id=created.id,
            email=created.email,
            full_name=created.full_name,
            role=created.role,
            status=created.status,
            created_at=created.created_at,
        )
