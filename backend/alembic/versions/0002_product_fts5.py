"""product full-text search (FTS5 + sync triggers)

Revision ID: 0002_product_fts5
Revises: 0001_initial
Create Date: 2026-09-14
"""
from collections.abc import Sequence

from alembic import op

revision: str = "0002_product_fts5"
down_revision: str | None = "0001_initial"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

CREATE = [
    """
    CREATE VIRTUAL TABLE product_fts USING fts5(
        title, brand, description, content='product', content_rowid='id'
    )
    """,
    """
    CREATE TRIGGER product_fts_ai AFTER INSERT ON product BEGIN
        INSERT INTO product_fts(rowid, title, brand, description)
        VALUES (new.id, new.title, new.brand, new.description);
    END
    """,
    """
    CREATE TRIGGER product_fts_ad AFTER DELETE ON product BEGIN
        INSERT INTO product_fts(product_fts, rowid, title, brand, description)
        VALUES ('delete', old.id, old.title, old.brand, old.description);
    END
    """,
    """
    CREATE TRIGGER product_fts_au AFTER UPDATE ON product BEGIN
        INSERT INTO product_fts(product_fts, rowid, title, brand, description)
        VALUES ('delete', old.id, old.title, old.brand, old.description);
        INSERT INTO product_fts(rowid, title, brand, description)
        VALUES (new.id, new.title, new.brand, new.description);
    END
    """,
]

DROP = [
    "DROP TRIGGER IF EXISTS product_fts_au",
    "DROP TRIGGER IF EXISTS product_fts_ad",
    "DROP TRIGGER IF EXISTS product_fts_ai",
    "DROP TABLE IF EXISTS product_fts",
]


def _sqlite() -> bool:
    # Postgres would use a tsvector column here; the search service is the only caller either way.
    return op.get_bind().dialect.name == "sqlite"


def upgrade() -> None:
    if _sqlite():
        for statement in CREATE:
            op.execute(statement)


def downgrade() -> None:
    if _sqlite():
        for statement in DROP:
            op.execute(statement)
