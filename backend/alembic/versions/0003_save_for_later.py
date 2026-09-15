"""cart items can be saved for later

Revision ID: 0003_save_for_later
Revises: 0002_product_fts5
Create Date: 2026-09-14
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003_save_for_later"
down_revision: str | None = "0002_product_fts5"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("cart_item") as batch:
        batch.add_column(
            sa.Column("saved_for_later", sa.Boolean(), nullable=False, server_default=sa.false())
        )


def downgrade() -> None:
    with op.batch_alter_table("cart_item") as batch:
        batch.drop_column("saved_for_later")
