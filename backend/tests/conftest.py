import pytest
from sqlalchemy import event
from sqlmodel import Session, SQLModel, create_engine

import app.models  # noqa: F401  -- registers every table on SQLModel.metadata
from app.ratelimit import _hits


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    # The limiter keys on client IP and TestClient always reports the same one, so
    # without this the suite trips its own 429 partway through.
    _hits.clear()


# SQLModel.metadata knows nothing about virtual tables, so create_all cannot build the
# FTS5 index that migration 0002 adds. Mirrored here so search is exercised by the suite
# rather than only in a real database.
_FTS_DDL = [
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


@pytest.fixture
def engine(tmp_path):
    engine = create_engine(
        f"sqlite:///{tmp_path / 'test.db'}", connect_args={"check_same_thread": False}
    )

    @event.listens_for(engine, "connect")
    def _pragmas(conn, _record):
        cur = conn.cursor()
        cur.execute("PRAGMA foreign_keys=ON")
        cur.execute("PRAGMA busy_timeout=5000")
        cur.close()

    SQLModel.metadata.create_all(engine)
    with engine.begin() as connection:
        for statement in _FTS_DDL:
            connection.exec_driver_sql(statement)
    return engine


@pytest.fixture
def session(engine):
    with Session(engine) as session:
        yield session


@pytest.fixture
def catalog(session):
    """One product, two variants: SKU-A (10 in stock, $19.99), SKU-B (1 in stock, $5.00)."""
    from app.models import Category, Product, ProductImage, Variant

    session.add(Category(id=1, name="Electronics", slug="electronics"))
    session.add(Product(id=1, slug="widget", title="Acme Widget", brand="Acme", category_id=1))
    session.add(ProductImage(product_id=1, url="https://img.test/widget.jpg", position=0))
    variants = [
        Variant(product_id=1, sku="SKU-A", price_cents=1999, stock=10, attrs={"Color": "Black"}),
        Variant(product_id=1, sku="SKU-B", price_cents=500, stock=1, attrs={"Color": "Sand"}),
    ]
    session.add_all(variants)
    session.commit()
    return {v.sku: v.id for v in variants}


@pytest.fixture
def make_client(engine):
    """Each call returns a registered user with its own cookie jar."""
    from fastapi.testclient import TestClient

    from app.db import get_session
    from app.main import app

    def override():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = override

    def build(email: str):
        client = TestClient(app)
        response = client.post(
            "/api/v1/auth/register",
            json={"email": email, "password": "password123", "name": email.split("@")[0]},
        )
        assert response.status_code == 201, response.text
        return client

    yield build
    app.dependency_overrides.clear()
