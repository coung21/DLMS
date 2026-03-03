"""Domain entities for the Digital Library Management System."""
from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4

from app.domain.enums import UserRole, UserStatus


@dataclass
class User:
    """Represents a registered user of the library system."""

    id: UUID = field(default_factory=uuid4)
    email: str = ""
    hashed_password: str = ""
    full_name: str = ""
    phone: str = ""
    role: UserRole = UserRole.MEMBER
    status: UserStatus = UserStatus.ACTIVE
    avatar_url: str | None = None
    max_loans: int = 5
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    @property
    def is_active(self) -> bool:
        return self.status == UserStatus.ACTIVE

    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN

    @property
    def is_librarian(self) -> bool:
        return self.role in (UserRole.ADMIN, UserRole.LIBRARIAN)
