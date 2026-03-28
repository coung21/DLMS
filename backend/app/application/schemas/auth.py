"""Auth schemas."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field

from app.domain.enums import UserRole, UserStatus


# --------------- Auth Schemas (mẫu) ---------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, description="Tối thiểu 8 ký tự")
    full_name: str = Field(min_length=2, max_length=255)
    role: UserRole = UserRole.STUDENT


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# --------------- User Schemas (mẫu) ---------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str
    phone: str = ""
    role: UserRole = UserRole.STUDENT


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    role: UserRole
    status: UserStatus
    created_at: datetime

    class Config:
        from_attributes = True
