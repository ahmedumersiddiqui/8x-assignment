"""Idempotent catalog seed. Re-running is a no-op unless --reset is passed.

uv run python -m app.seed.run [--reset]
"""

import argparse
import logging
import random

from sqlalchemy import text
from sqlmodel import Session, select

from app.cache import bump_catalog_version
from app.db import engine
from app.models import Category, Product, ProductImage, Review, Store, User, Variant
from app.security import hash_password
from app.seed import data
from app.seed.images import product_image
from app.services.slug import unique_slug

log = logging.getLogger("seed")

DEMO_USER = {"email": "demo@example.com", "password": "demo12345", "name": "Demo Shopper"}


def _slugify(text: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in text.lower()).strip("-").replace("--", "-")


def _build_product(rng: random.Random, sub, category_id: int, store_id: int, index: int):
    _name, sub_slug, noun, brands, (low, high), (axis, values) = sub
    brand = rng.choice(brands)
    series = rng.choice(data.SERIES)
    model = rng.choice(data.MODEL_NUMBERS)
    title = f"{brand} {series} {model} {noun}"
    slug = _slugify(f"{title}-{sub_slug}-{index}")
    base = rng.randrange(low, high, 100) + 99
    product = Product(
        slug=slug,
        title=title,
        brand=brand,
        category_id=category_id,
        store_id=store_id,
        description=(
            f"The {brand} {series} {model} is a {noun.lower()} built for people who use one every "
            f"day. It ships ready to go and is covered by a two-year warranty."
        ),
        bullets=rng.sample(data.BULLETS, 4),
        specs={
            key: value.format(brand=brand, series=series, model=model, weight=rng.randint(1, 12))
            for key, value in data.SPECS.items()
        },
        rating_avg=0.0,
        rating_count=0,
    )
    images = [
        ProductImage(url=product_image(slug, sub_slug, n), position=n)
        for n in range(data.IMAGES_PER_PRODUCT)
    ]
    variants = [
        Variant(
            sku=f"{sub_slug[:4].upper()}-{index:03d}-{n}",
            attrs={axis: value},
            price_cents=base + n * rng.choice([0, 500, 1500]),
            list_price_cents=(base + n * 500) * 4 // 3 if rng.random() < 0.4 else None,
            stock=rng.choice([0, 3, 11, 42, 120]),
        )
        for n, value in enumerate(values)
    ]
    product.images = images
    product.variants = variants
    return product


def _reviews(rng: random.Random, product: Product, reviewers: list[User]) -> list[Review]:
    low, high = data.REVIEWS_PER_PRODUCT
    stars = list(data.RATING_WEIGHTS)
    weights = list(data.RATING_WEIGHTS.values())
    return [
        Review(
            product_id=product.id,
            user_id=author.id,
            rating=rng.choices(stars, weights)[0],
            title=rng.choice(data.REVIEW_TITLES),
            body=rng.choice(data.REVIEW_BODIES),
            author_name=author.name,
            verified_purchase=rng.random() < 0.7,
        )
        for author in rng.sample(reviewers, rng.randint(low, high))
    ]


def _stores(session: Session, demo: User, password_hash: str) -> dict[str, Store]:
    """One store per department, keyed by the department it sells into.

    Sellers are real user rows: a store belongs to somebody who can sign in and manage it,
    which is the same path a listing created through the UI takes.
    """
    by_category: dict[str, Store] = {}
    for display_name, category_slug, owner in data.STORES:
        if owner is None:
            user = demo
        else:
            email, name = owner
            user = session.exec(select(User).where(User.email == email)).first()
            if not user:
                user = User(email=email, name=name, password_hash=password_hash)
                session.add(user)
                session.commit()
                session.refresh(user)

        store = session.exec(
            select(Store).where(Store.user_id == user.id, Store.display_name == display_name)
        ).first()
        if not store:
            store = Store(
                user_id=user.id,
                display_name=display_name,
                slug=unique_slug(session, Store.slug, display_name),
            )
            session.add(store)
            session.commit()
            session.refresh(store)
        by_category[category_slug] = store
    return by_category


def _reviewer_pool(session: Session, password_hash: str) -> list[User]:
    pool = []
    for index, name in enumerate(data.REVIEWER_NAMES):
        email = f"reviewer{index}@example.com"
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            user = User(email=email, name=name, password_hash=password_hash)
            session.add(user)
        pool.append(user)
    session.commit()
    for user in pool:
        session.refresh(user)
    return pool


_WIPE = [
    "DELETE FROM order_item",
    "DELETE FROM 'order'",
    "DELETE FROM cart_item",
    "DELETE FROM cart",
    "DELETE FROM review",
    "DELETE FROM variant",
    "DELETE FROM product_image",
    "DELETE FROM product",
    "DELETE FROM store",
    "DELETE FROM category WHERE parent_id IS NOT NULL",
    "DELETE FROM category",
]


def _clear(session: Session) -> None:
    for statement in _WIPE:
        session.execute(text(statement))
    session.commit()


def seed(reset: bool = False) -> None:
    with Session(engine) as session:
        if reset:
            _clear(session)
        elif session.exec(select(Product).limit(1)).first():
            log.info("catalog already seeded, nothing to do (pass --reset to rebuild)")
            return

        rng = random.Random(data.RANDOM_SEED)
        password_hash = hash_password(DEMO_USER["password"])
        user = session.exec(select(User).where(User.email == DEMO_USER["email"])).first()
        if not user:
            user = User(
                email=DEMO_USER["email"],
                name=DEMO_USER["name"],
                password_hash=password_hash,
                is_prime=True,
            )
            session.add(user)
            session.commit()
            session.refresh(user)

        stores = _stores(session, user, password_hash)
        reviewers = _reviewer_pool(session, password_hash)
        review_count = 0

        count = 0
        for name, slug in data.CATEGORIES:
            parent = Category(name=name, slug=slug)
            session.add(parent)
            session.commit()
            session.refresh(parent)
            for sub in data.SUBCATEGORIES[slug]:
                child = Category(name=sub[0], slug=sub[1], parent_id=parent.id)
                session.add(child)
                session.commit()
                session.refresh(child)
                for index in range(data.PRODUCTS_PER_SUBCATEGORY):
                    product = _build_product(rng, sub, child.id, stores[slug].id, count)
                    session.add(product)
                    session.flush()
                    reviews = _reviews(rng, product, reviewers)
                    session.add_all(reviews)
                    product.rating_count = len(reviews)
                    product.rating_avg = round(
                        sum(review.rating for review in reviews) / len(reviews), 1
                    )
                    session.add(product)
                    session.commit()
                    review_count += len(reviews)
                    count += 1

        bump_catalog_version()
        log.info(
            "seeded %s products, %s reviews across %s categories in %s stores",
            count,
            review_count,
            len(data.CATEGORIES),
            len(stores),
        )


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="wipe the catalog and rebuild")
    seed(parser.parse_args().reset)
