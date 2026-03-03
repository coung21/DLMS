"""SQLAlchemy ORM models – chỉ chứa mẫu UserModel."""
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class UserModel(Base):
    """Mẫu ORM model – thêm DocumentModel, LoanModel... khi triển khai."""
    __tablename__ = "users"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), default="")
    role = Column(String(20), nullable=False, default="member")
    status = Column(String(20), nullable=False, default="active")
    avatar_url = Column(String(500), nullable=True)
    max_loans = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
