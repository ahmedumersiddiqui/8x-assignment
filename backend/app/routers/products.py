import json

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.cache import cached
from app.deps import DeliveryPostalCode, SessionDep
from app.models import Category, Product
from app.routers.constants import (
    DEFAULT_DELIVERY_OPTION,
    PRODUCT_DETAIL_TTL_SECONDS,
    PRODUCT_LIST_TTL_SECONDS,
)
from app.schemas.catalog import (
    ProductCard,
    ProductDetail,
    ProductQuery,
    SearchResponse,
    VariantOut,
)
from app.services.pricing import delivery_estimate
from app.services.search import facets, page_ids

router = APIRouter(prefix="/products", tags=["products"])


def _card(product: Product) -> ProductCard:
    cheapest = min(product.variants, key=lambda v: v.price_cents)
    return ProductCard(
        id=product.id,
        slug=product.slug,
        title=product.title,
        brand=product.brand,
        rating_avg=product.rating_avg,
        rating_count=product.rating_count,
        price_cents=cheapest.price_cents,
        list_price_cents=cheapest.list_price_cents,
        image=product.images[0].url if product.images else None,
        in_stock=any(v.stock > 0 for v in product.variants),
    )


def _hydrate(session: Session, ids: list[int]) -> list[Product]:
    if not ids:
        return []
    rows = session.exec(
        select(Product)
        .where(Product.id.in_(ids))
        .options(selectinload(Product.images), selectinload(Product.variants))
    ).all()
    by_id = {p.id: p for p in rows}
    return [by_id[i] for i in ids if i in by_id]


@router.get("", response_model=SearchResponse)
def list_products(
    session: SessionDep,
    postal_code: DeliveryPostalCode,
    query: ProductQuery = Query(),
):
    key = (
        f"products:{postal_code or 'default'}:"
        + json.dumps(query.model_dump(), sort_keys=True, default=str)
    )

    def build() -> dict:
        ids, total = page_ids(session, query)
        return SearchResponse(
            items=[_card(p) for p in _hydrate(session, ids)],
            total=total,
            page=query.page,
            page_size=query.page_size,
            facets=facets(session, query),
            delivery_estimate=delivery_estimate(DEFAULT_DELIVERY_OPTION, postal_code),
        ).model_dump()

    # ponytail: the estimate is baked into the cached page for up to PRODUCT_LIST_TTL_SECONDS,
    # so a page cached just before midnight can quote yesterday's date for a minute.
    return cached(key, build, PRODUCT_LIST_TTL_SECONDS, model=SearchResponse)


@router.get("/{slug}", response_model=ProductDetail)
def get_product(slug: str, session: SessionDep, postal_code: DeliveryPostalCode):
    def build() -> dict:
        product = session.exec(
            select(Product)
            .where(Product.slug == slug)
            .options(
                selectinload(Product.images),
                selectinload(Product.variants),
                selectinload(Product.store),
            )
        ).first()
        if not product:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
        category = session.get(Category, product.category_id)
        return ProductDetail(
            **_card(product).model_dump(),
            description=product.description,
            bullets=product.bullets,
            specs=product.specs,
            images=[i.url for i in product.images],
            variants=[VariantOut.model_validate(v, from_attributes=True) for v in product.variants],
            category_slug=category.slug if category else "",
            # Computed here, not in the browser: the business rule stays on one side.
            delivery_estimate=delivery_estimate(DEFAULT_DELIVERY_OPTION, postal_code),
            sold_by=product.store.display_name if product.store else None,
            store_slug=product.store.slug if product.store else None,
        ).model_dump()

    return cached(
        f"product:{postal_code or 'default'}:{slug}",
        build,
        PRODUCT_DETAIL_TTL_SECONDS,
        model=ProductDetail,
    )
