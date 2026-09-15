from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from sqlmodel import func, select

from app.cache import cached
from app.deps import CurrentUser, OwnedStore, SessionDep
from app.models import Product, Store
from app.routers.constants import (
    STORE_LISTINGS_PAGE_SIZE_DEFAULT,
    STORE_LISTINGS_PAGE_SIZE_MAX,
    STOREFRONT_TTL_SECONDS,
    STORES_PER_USER_MAX,
)
from app.schemas.common import Page
from app.schemas.store import (
    ListingCreate,
    ListingOut,
    StoreCreate,
    StorefrontOut,
    StoreOut,
)
from app.services.listings import (
    CategoryNotFound,
    ImageMissing,
    ImageNotOwned,
    ListingHasSales,
    create_listing,
    delete_listing,
    listing_counts,
    owned_listing,
    stores_for,
    to_listing_out,
)
from app.services.slug import unique_slug

router = APIRouter(prefix="/stores", tags=["stores"])


@router.get("", response_model=list[StoreOut])
def my_stores(user: CurrentUser, session: SessionDep):
    """Every store this account runs. Not paginated on purpose -- STORES_PER_USER_MAX is
    the bound, and the sell screen needs all of them to render the picker."""
    stores = stores_for(session, user)
    counts = listing_counts(session, [store.id for store in stores])
    return [
        StoreOut(
            id=store.id,
            display_name=store.display_name,
            slug=store.slug,
            created_at=store.created_at,
            listing_count=counts.get(store.id, 0),
        )
        for store in stores
    ]


@router.post("", response_model=StoreOut, status_code=status.HTTP_201_CREATED)
def open_store(body: StoreCreate, user: CurrentUser, session: SessionDep):
    if len(stores_for(session, user)) >= STORES_PER_USER_MAX:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"An account can run up to {STORES_PER_USER_MAX} stores",
        )
    store = Store(
        user_id=user.id,
        display_name=body.display_name,
        slug=unique_slug(session, Store.slug, body.display_name),
    )
    session.add(store)
    try:
        session.commit()
    except IntegrityError as error:
        # uq_store_name_per_user. Cheaper and race-free compared to checking first.
        session.rollback()
        raise HTTPException(
            status.HTTP_409_CONFLICT, "You already have a store with that name"
        ) from error
    session.refresh(store)
    return StoreOut(
        id=store.id,
        display_name=store.display_name,
        slug=store.slug,
        created_at=store.created_at,
        listing_count=0,
    )


@router.get("/{store_id}/listings", response_model=Page[ListingOut])
def store_listings(
    store: OwnedStore,
    session: SessionDep,
    page: int = Query(1, ge=1),
    page_size: int = Query(
        STORE_LISTINGS_PAGE_SIZE_DEFAULT, ge=1, le=STORE_LISTINGS_PAGE_SIZE_MAX
    ),
):
    total = session.exec(
        select(func.count()).select_from(Product).where(Product.store_id == store.id)
    ).one()
    rows = session.exec(
        select(Product)
        .where(Product.store_id == store.id)
        # Without these, a 20-row page is 1 query for the list and 40 more for the rows.
        .options(selectinload(Product.images), selectinload(Product.variants))
        .order_by(Product.created_at.desc(), Product.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return Page[ListingOut](
        items=[to_listing_out(product) for product in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post(
    "/{store_id}/listings", response_model=ListingOut, status_code=status.HTTP_201_CREATED
)
def create(body: ListingCreate, store: OwnedStore, session: SessionDep):
    try:
        product = create_listing(session, store, body)
    except CategoryNotFound as error:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY, "That category does not exist"
        ) from error
    except ImageNotOwned as error:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN, "That image does not belong to this store"
        ) from error
    except ImageMissing as error:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, error.reason) from error
    return to_listing_out(product)


@router.delete("/{store_id}/listings/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove(product_id: int, store: OwnedStore, session: SessionDep):
    product = owned_listing(session, store, product_id)
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    try:
        delete_listing(session, product)
    except ListingHasSales as error:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "This listing has already sold and cannot be removed",
        ) from error


# --- public ------------------------------------------------------------------------------
# Everything above is the seller's own view and needs a session. This one is the shopper's:
# it takes a slug rather than an id, and returns nothing that is not already on the PDP.


@router.get("/{slug}", response_model=StorefrontOut)
def storefront(slug: str, session: SessionDep):
    """A store's public profile. The products themselves come from the catalogue endpoint
    with `store=<slug>`, so the storefront gets the same sorting, facets and paging as
    every other grid instead of a parallel listing route."""

    def build() -> dict:
        store = session.exec(select(Store).where(Store.slug == slug)).first()
        if not store:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Store not found")
        listing_count = session.exec(
            select(func.count()).select_from(Product).where(Product.store_id == store.id)
        ).one()
        return StorefrontOut(
            display_name=store.display_name,
            slug=store.slug,
            created_at=store.created_at,
            listing_count=listing_count,
        ).model_dump()

    return cached(f"storefront:{slug}", build, STOREFRONT_TTL_SECONDS, model=StorefrontOut)
