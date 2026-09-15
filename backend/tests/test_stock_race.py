"""The oversell test. Twelve threads, one unit of stock, exactly one winner."""

from concurrent.futures import ThreadPoolExecutor

from sqlmodel import Session

from app.models import Category, Product, Variant
from app.services.stock import reserve

THREADS = 12


def _variant(session: Session, stock: int) -> int:
    session.add(Category(id=1, name="Electronics", slug="electronics"))
    session.add(Product(id=1, slug="p", title="Widget", brand="Acme", category_id=1))
    variant = Variant(product_id=1, sku="SKU-1", price_cents=1000, stock=stock)
    session.add(variant)
    session.commit()
    return variant.id


def test_concurrent_reserves_never_oversell(engine, session):
    variant_id = _variant(session, stock=1)

    def attempt() -> bool:
        with Session(engine) as s:
            ok = reserve(s, variant_id, 1)
            s.commit() if ok else s.rollback()
            return ok

    with ThreadPoolExecutor(THREADS) as pool:
        results = list(pool.map(lambda _: attempt(), range(THREADS)))

    assert sum(results) == 1
    session.expire_all()
    assert session.get(Variant, variant_id).stock == 0


def test_reserve_refuses_to_go_negative(engine, session):
    variant_id = _variant(session, stock=3)
    with Session(engine) as s:
        assert reserve(s, variant_id, 4) is False
        s.rollback()
    session.expire_all()
    assert session.get(Variant, variant_id).stock == 3
