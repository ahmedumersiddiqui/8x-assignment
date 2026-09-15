import re

from sqlalchemy import func, text
from sqlmodel import Session, select

from app.models import Product, Store, Variant
from app.schemas.catalog import FacetCount, Facets, ProductQuery
from app.services.categories import descendant_ids
from app.services.constants import FTS_CANDIDATE_LIMIT

_RANKED = text(
    "SELECT rowid FROM product_fts WHERE product_fts MATCH :q "
    "ORDER BY bm25(product_fts) LIMIT :limit"
)


def to_match(q: str) -> str:
    """FTS5 has its own query grammar; quote each token so user punctuation can't break it."""
    tokens = re.findall(r"\w+", q)
    return " ".join(f'"{t}"*' for t in tokens)


def ranked_ids(session: Session, q: str) -> list[int]:
    match = to_match(q)
    if not match:
        return []
    rows = session.execute(_RANKED, {"q": match, "limit": FTS_CANDIDATE_LIMIT})
    return [row[0] for row in rows]


def _candidates(session: Session, query: ProductQuery, *, apply_brand: bool):
    price = func.min(Variant.price_cents).label("price_cents")
    stock = func.max(Variant.stock).label("stock")
    stmt = (
        select(Product.id, price, stock, Product.brand, Product.rating_avg, Product.created_at)
        .join(Variant, Variant.product_id == Product.id)
        .group_by(Product.id)
    )
    if query.q:
        stmt = stmt.where(Product.id.in_(ranked_ids(session, query.q)))
    if query.category:
        stmt = stmt.where(Product.category_id.in_(descendant_ids(session, query.category)))
    if query.store:
        # A subquery rather than a join: the store slug is unique, so this resolves to at
        # most one id and keeps the GROUP BY above untouched.
        stmt = stmt.where(
            Product.store_id.in_(select(Store.id).where(Store.slug == query.store))
        )
    if apply_brand and query.brand:
        stmt = stmt.where(Product.brand.in_(query.brand))
    if query.min_rating:
        stmt = stmt.where(Product.rating_avg >= query.min_rating)
    if query.min_price is not None:
        stmt = stmt.having(price >= query.min_price)
    if query.max_price is not None:
        stmt = stmt.having(price <= query.max_price)
    if query.in_stock:
        stmt = stmt.having(stock > 0)
    return stmt


_ORDER = {
    "price_asc": lambda c: c.c.price_cents.asc(),
    "price_desc": lambda c: c.c.price_cents.desc(),
    "rating": lambda c: c.c.rating_avg.desc(),
    "newest": lambda c: c.c.created_at.desc(),
    "featured": lambda c: c.c.rating_avg.desc(),
}


def page_ids(session: Session, query: ProductQuery) -> tuple[list[int], int]:
    sub = _candidates(session, query, apply_brand=True).subquery()
    total = session.exec(select(func.count()).select_from(sub)).one()
    rows = session.execute(
        select(sub.c.id)
        .order_by(_ORDER[query.sort](sub), sub.c.id)
        .offset((query.page - 1) * query.page_size)
        .limit(query.page_size)
    )
    return [row[0] for row in rows], total


def facets(session: Session, query: ProductQuery) -> Facets:
    brand_sub = _candidates(session, query, apply_brand=False).subquery()
    brands = session.execute(
        select(brand_sub.c.brand, func.count())
        .group_by(brand_sub.c.brand)
        .order_by(func.count().desc())
    )
    sub = _candidates(session, query, apply_brand=True).subquery()
    span = session.execute(select(func.min(sub.c.price_cents), func.max(sub.c.price_cents))).one()
    ratings = [
        FacetCount(
            value=str(stars),
            count=session.execute(
                select(func.count()).select_from(sub).where(sub.c.rating_avg >= stars)
            ).scalar_one(),
        )
        for stars in (4, 3, 2, 1)
    ]
    return Facets(
        brands=[FacetCount(value=b, count=c) for b, c in brands],
        ratings=ratings,
        price_min_cents=span[0] or 0,
        price_max_cents=span[1] or 0,
    )
