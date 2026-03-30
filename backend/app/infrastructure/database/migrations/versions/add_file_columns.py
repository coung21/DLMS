"""Add missing file_size and original_file_name columns

Revision ID: add_file_columns
Revises: add_review_workflow
Create Date: 2026-03-30

Thêm columns file_size và original_file_name vào documents table
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers
revision: str = "add_file_columns"
down_revision: Union[str, None] = "add_review_workflow"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "documents",
        sa.Column("file_size", sa.Integer(), nullable=False, server_default="0")
    )
    op.add_column(
        "documents",
        sa.Column("original_file_name", sa.String(255), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("documents", "original_file_name")
    op.drop_column("documents", "file_size")
