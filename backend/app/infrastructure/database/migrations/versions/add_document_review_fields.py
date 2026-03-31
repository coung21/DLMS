"""Add document review workflow fields

Revision ID: add_review_workflow
Revises: cb638f60bf0c
Create Date: 2026-03-30

Thêm fields cho workflow duyệt tài liệu:
- status (pending, approved, rejected, archived, deleted)
- reviewed_by (FK to users)
- review_comment (lý do phê duyệt/từ chối)
- updated_at
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers
revision: str = "add_review_workflow"
down_revision: Union[str, None] = "cb638f60bf0c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add columns to documents table for review workflow
    op.add_column(
        "documents",
        sa.Column("status", sa.String(50), nullable=False, server_default="pending")
    )
    op.add_column(
        "documents",
        sa.Column("reviewed_by", UUID(as_uuid=True), nullable=True)
    )
    op.add_column(
        "documents",
        sa.Column("review_comment", sa.Text(), nullable=True)
    )
    
    # Add foreign key constraint for reviewed_by
    op.create_foreign_key(
        "fk_documents_reviewed_by",
        "documents",
        "users",
        ["reviewed_by"],
        ["id"],
        ondelete="SET NULL"
    )
    
    # Create index on status for faster queries
    op.create_index("ix_documents_status", "documents", ["status"])


def downgrade() -> None:
    op.drop_index("ix_documents_status", table_name="documents")
    op.drop_constraint("fk_documents_reviewed_by", "documents", type_="foreignkey")
    op.drop_column("documents", "review_comment")
    op.drop_column("documents", "reviewed_by")
    op.drop_column("documents", "status")
