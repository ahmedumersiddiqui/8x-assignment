"""users can open stores and list their own products

Revision ID: 0005_stores_and_listings
Revises: 0004_widen_product_image_url
Create Date: 2026-09-14
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0005_stores_and_listings"
down_revision: str | None = "0004_widen_product_image_url"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# 0002 hangs three FTS sync triggers off `product`. SQLite's batch_alter_table works by
# building a new table, copying, dropping the old one and renaming -- and dropping the old
# table takes its triggers with it, silently un-indexing the catalogue. Plain ADD COLUMN
# needs no rebuild, so upgrade() avoids batch mode entirely. downgrade() cannot (SQLite
# grew DROP COLUMN only in 3.35 and it still refuses on an indexed column), so it puts the
# triggers back by hand afterwards.
_FTS_TRIGGERS = [
    """
    CREATE TRIGGER IF NOT EXISTS product_fts_ai AFTER INSERT ON product BEGIN
        INSERT INTO product_fts(rowid, title, brand, description)
        VALUES (new.id, new.title, new.brand, new.description);
    END
    """,
    """
    CREATE TRIGGER IF NOT EXISTS product_fts_ad AFTER DELETE ON product BEGIN
        INSERT INTO product_fts(product_fts, rowid, title, brand, description)
        VALUES ('delete', old.id, old.title, old.brand, old.description);
    END
    """,
    """
    CREATE TRIGGER IF NOT EXISTS product_fts_au AFTER UPDATE ON product BEGIN
        INSERT INTO product_fts(product_fts, rowid, title, brand, description)
        VALUES ('delete', old.id, old.title, old.brand, old.description);
        INSERT INTO product_fts(rowid, title, brand, description)
        VALUES (new.id, new.title, new.brand, new.description);
    END
    """,
]


def _is_sqlite() -> bool:
    return op.get_bind().dialect.name == "sqlite"


def upgrade() -> None:
    op.create_table(
        "store",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("display_name", sa.String(length=120), nullable=False),
        sa.Column("slug", sa.String(length=140), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("user_id", "display_name", name="uq_store_name_per_user"),
    )
    op.create_index("ix_store_user_id", "store", ["user_id"])
    op.create_index("ix_store_slug", "store", ["slug"], unique=True)

    # Alembic splits an inline ForeignKey into a separate ADD CONSTRAINT, which SQLite
    # cannot do outside batch mode -- so on SQLite the column and its REFERENCES clause go
    # in as one statement, which ADD COLUMN does support for a NULL-defaulted column.
    if _is_sqlite():
        op.execute("ALTER TABLE product ADD COLUMN store_id INTEGER REFERENCES store(id)")
    else:
        op.add_column(
            "product",
            sa.Column("store_id", sa.Integer(), sa.ForeignKey("store.id"), nullable=True),
        )
    op.create_index("ix_product_store_id", "product", ["store_id"])


def downgrade() -> None:
    op.drop_index("ix_product_store_id", table_name="product")
    if _is_sqlite():
        # The batch rebuild ends in DROP TABLE product, and SQLite runs that as a delete
        # of every row -- which trips the FKs product_image and variant hold against it.
        # Alembic does not manage this pragma, so the rebuild has to bracket it itself.
        op.execute("PRAGMA foreign_keys=OFF")
    with op.batch_alter_table("product") as batch:
        batch.drop_column("store_id")
    if _is_sqlite():
        for statement in _FTS_TRIGGERS:
            op.execute(statement)
        op.execute("PRAGMA foreign_keys=ON")
    op.drop_index("ix_store_slug", table_name="store")
    op.drop_index("ix_store_user_id", table_name="store")
    op.drop_table("store")
