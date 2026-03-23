from app.application.schemas import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.core.exceptions import AuthenticationError, DuplicateEntityError
from app.domain.entities.user import User
from app.domain.repositories.user_repository import IUserRepository
from app.infrastructure.security.jwt import create_access_token, create_refresh_token, hash_password, verify_password


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

    async def login(self, data: LoginRequest) -> TokenResponse:
        """Đăng nhập. Raise AuthenticationError nếu sai thông tin."""
        user = await self._user_repo.get_by_email(data.email)
        if not user:
            raise AuthenticationError("Email hoặc mật khẩu không đúng.")

        if not verify_password(data.password, user.hashed_password):
            raise AuthenticationError("Email hoặc mật khẩu không đúng.")

        access_token = create_access_token(user.id, user.role.value)
        refresh_token = create_refresh_token(user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )

