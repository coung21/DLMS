"""Domain enums – chỉ chứa mẫu, thêm khi triển khai feature mới."""
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    LIBRARIAN = "librarian"
    MEMBER = "member"
    GUEST = "guest"


class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


# Thêm DocumentType, DocumentStatus, LoanStatus, NotificationType... khi triển khai
