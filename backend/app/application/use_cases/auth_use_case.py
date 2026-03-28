from app.application.schemas import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.core.exceptions import AuthenticationError, DuplicateEntityError
from app.domain.entities.user import User
from app.domain.repositories.user_repository import IUserRepository
from app.infrastructure.security.jwt import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)


from app.domain.enums import UserRole, UserStatus


class AuthUseCase:
    def __init__(self, user_repo: IUserRepository) -> None:
        self._user_repo = user_repo

    async def register(self, data: RegisterRequest) -> UserResponse:
        """Create a new account or raise DuplicateEntityError if email exists."""
        existing = await self._user_repo.get_by_email(data.email)
        if existing:
            raise DuplicateEntityError(f"Email '{data.email}' đã được đăng ký.")

        # Phân quyền: Teacher cần admin duyệt (status INACTIVE)
        status = UserStatus.INACTIVE if data.role == UserRole.TEACHER else UserStatus.ACTIVE

        user = User(
            email=data.email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
            role=data.role,
            status=status,
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

    async def login(self, data: LoginRequest) -> TokenResponse:
        """Authenticate a user or raise AuthenticationError on failure."""
        user = await self._user_repo.get_by_email(data.email)
        if not user:
            raise AuthenticationError("Email hoặc mật khẩu không đúng.")

        if not verify_password(data.password, user.hashed_password):
            raise AuthenticationError("Email hoặc mật khẩu không đúng.")

        if user.status != UserStatus.ACTIVE:
            raise AuthenticationError("Tài khoản chưa được kích hoạt hoặc đã bị khóa.")

        access_token = create_access_token(user.id, user.role.value)
        refresh_token = create_refresh_token(user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )
