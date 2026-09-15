"""product images are generated data: URIs, which do not fit VARCHAR(500)

SQLite does not enforce VARCHAR length, so this is a no-op there. It matters for the
Postgres migration the README describes, where the old width would truncate every image.

Revision ID: 0004_widen_product_image_url
Revises: 0003_save_for_later
Create Date: 2026-09-14
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0004_widen_product_image_url"
down_revision: str | None = "0003_save_for_later"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("product_image") as batch:
        batch.alter_column(
            "url",
            existing_type=sa.VARCHAR(length=500),
            type_=sa.VARCHAR(length=4000),
            existing_nullable=False,
        )


def downgrade() -> None:
    with op.batch_alter_table("product_image") as batch:
        batch.alter_column(
            "url",
            existing_type=sa.VARCHAR(length=4000),
            type_=sa.VARCHAR(length=500),
            existing_nullable=False,
        )
