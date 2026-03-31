"""SQLAlchemy ORM models – theo ERD erd.puml."""
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey,
    String, Text, Integer
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class RoleModel(Base):
    __tablename__ = "roles"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("UserModel", back_populates="role")


class UserModel(Base):
    __tablename__ = "users"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(Text, nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    role_id = Column(PGUUID(as_uuid=True), ForeignKey("roles.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    role = relationship("RoleModel", back_populates="users")
    documents_uploaded = relationship("DocumentModel", foreign_keys="DocumentModel.uploaded_by", back_populates="uploader")


class CategoryModel(Base):
    __tablename__ = "categories"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    documents = relationship("DocumentModel", back_populates="category")


class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, default="")
    file_path = Column(Text, nullable=True)
    file_type = Column(String(50), nullable=True)
    file_size = Column(Integer, default=0)
    original_file_name = Column(String(255), nullable=True)
    status = Column(String(50), default="pending", nullable=False)
    uploaded_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    review_comment = Column(Text, nullable=True)
    category_id = Column(PGUUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    uploader = relationship("UserModel", foreign_keys=[uploaded_by], back_populates="documents_uploaded")
    reviewer = relationship("UserModel", foreign_keys=[reviewed_by])
    category = relationship("CategoryModel", back_populates="documents")
