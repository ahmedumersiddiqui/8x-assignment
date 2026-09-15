"""Store listings: turning a submitted form into a real catalogue product.

A listing is an ordinary Product with store_id set, which is the point -- it lands in the
same search index, the same grid and the same buy box as the seeded catalogue, with no
second code path to keep in sync.
"""

import logging
from uuid import uuid4

from sqlmodel import Session, func, select

from app.cache import bump_catalog_version
from app.models import Category, OrderItem, Product, ProductImage, Store, User, Variant
from app.models.cart import CartItem
from app.schemas.store import ListingCreate, ListingOut
from app.services import r2
from app.services.constants import MAX_UPLOAD_BYTES
from app.services.slug import unique_slug

log = logging.getLogger(__name__)


class CategoryNotFound(Exception):
    pass


class ImageNotOwned(Exception):
    """A key outside this store's own prefix. Someone is probing for other people's keys."""


class ImageMissing(Exception):
    def __init__(self, key: str, reason: str) -> None:
        super().__init__(f"{reason} ({key})")
        self.key, self.reason = key, reason


class ListingHasSales(Exception):
    pass


def owned_store(session: Session, user: User, store_id: int) -> Store | None:
    """None covers both missing and not-yours, so callers answer 404 to each and leak
    nothing about which stores exist."""
    store = session.get(Store, store_id)
    return store if store and store.user_id == user.id else None


def stores_for(session: Session, user: User) -> list[Store]:
    return list(
        session.exec(
            select(Store).where(Store.user_id == user.id).order_by(Store.created_at, Store.id)
        ).all()
    )


def listing_counts(session: Session, store_ids: list[int]) -> dict[int, int]:
    """One grouped query for the whole store picker, rather than a count per row."""
    if not store_ids:
        return {}
    rows = session.exec(
        select(Product.store_id, func.count())
        .where(Product.store_id.in_(store_ids))
        .group_by(Product.store_id)
    ).all()
    return dict(rows)


def _verify_images(store: Store, keys: list[str]) -> None:
    """Every key must sit in this store's prefix and actually be present in the bucket.

    The prefix check is the IDOR guard -- keys are unguessable, but "unguessable" is not a
    permission. The HEAD is what stops a listing from being built around an upload that
    silently failed, and it re-checks the cap against the bytes R2 really holds rather
    than the size the client claimed when it asked for the ticket.
    """
    for key in keys:
        if not r2.owns_key(key, store.id):
            raise ImageNotOwned(key)
        size = r2.object_size(key)
        if size is None:
            raise ImageMissing(key, "That image is not in storage")
        if size > MAX_UPLOAD_BYTES:
            r2.delete_objects([key])
            raise ImageMissing(key, "That image is larger than the upload limit")


def create_listing(session: Session, store: Store, body: ListingCreate) -> Product:
    category = session.exec(select(Category).where(Category.slug == body.category_slug)).first()
    if not category:
        raise CategoryNotFound(body.category_slug)

    _verify_images(store, body.image_keys)

    product = Product(
        slug=unique_slug(session, Product.slug, body.title),
        title=body.title.strip(),
        brand=body.brand.strip(),
        category_id=category.id,
        store_id=store.id,
        description=body.description.strip(),
        bullets=body.bullets,
        specs={},
    )
    product.images = [
        ProductImage(url=r2.public_url(key), position=index)
        for index, key in enumerate(body.image_keys)
    ]
    product.variants = [
        Variant(
            # Unique without a lookup: the store scopes it, the hex makes collisions a
            # non-event, and the index keeps the options readable in an order.
            sku=f"S{store.id}-{uuid4().hex[:8].upper()}-{index + 1}",
            attrs=variant.attrs,
            price_cents=variant.price_cents,
            list_price_cents=variant.list_price_cents,
            stock=variant.stock,
        )
        for index, variant in enumerate(body.variants)
    ]

    # One transaction: a listing with no variants would render a PDP with no buy box.
    session.add(product)
    session.commit()
    session.refresh(product)
    bump_catalog_version()
    log.info("listing created: product=%s store=%s", product.id, store.id)
    return product


def owned_listing(session: Session, store: Store, product_id: int) -> Product | None:
    product = session.get(Product, product_id)
    return product if product and product.store_id == store.id else None


def delete_listing(session: Session, product: Product) -> None:
    product_id = product.id
    variant_ids = [variant.id for variant in product.variants]
    sold = session.exec(
        select(func.count()).select_from(OrderItem).where(OrderItem.variant_id.in_(variant_ids))
    ).one()
    if sold:
        # Order items reference the variant row, and an order must never change because a
        # product did. Refusing the delete is the only answer that keeps both true.
        raise ListingHasSales

    # A cart line is not sacred the way an order is; drop them so the FK stays satisfied.
    for item in session.exec(select(CartItem).where(CartItem.variant_id.in_(variant_ids))).all():
        session.delete(item)

    keys = [key for key in (r2.key_from_url(image.url) for image in product.images) if key]
    session.delete(product)
    session.commit()
    r2.delete_objects(keys)
    bump_catalog_version()
    log.info("listing deleted: product=%s", product_id)


def to_listing_out(product: Product) -> ListingOut:
    cheapest = min(product.variants, key=lambda variant: variant.price_cents)
    return ListingOut(
        id=product.id,
        store_id=product.store_id,
        slug=product.slug,
        title=product.title,
        brand=product.brand,
        image=product.images[0].url if product.images else None,
        price_cents=cheapest.price_cents,
        list_price_cents=cheapest.list_price_cents,
        stock=sum(variant.stock for variant in product.variants),
        variant_count=len(product.variants),
        rating_avg=product.rating_avg,
        rating_count=product.rating_count,
        created_at=product.created_at,
    )

