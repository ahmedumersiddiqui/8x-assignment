"""Stores and listings: the upload cap, the ownership boundary, and what delete may not do.

R2 is never reached. Presigning is pure local crypto so it runs for real, while the two
calls that would need the network -- HEAD and DELETE -- are served by a fake bucket.
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.config import settings
from app.models import Category, Order, OrderItem, Product, Variant
from app.routers.constants import STORES_PER_USER_MAX
from app.services import r2
from app.services.constants import MAX_UPLOAD_BYTES

LISTING = {
    "title": "Handmade Walnut Desk Tray",
    "brand": "Fern and Oak",
    "category_slug": "electronics",
    "description": "Turned from a single offcut.",
    "bullets": ["Solid walnut", "  ", "Oiled finish"],
    "variants": [{"attrs": {"Size": "Small"}, "price_cents": 2499, "stock": 4}],
}


class Bucket:
    """key -> size in bytes, plus a record of what got deleted."""

    def __init__(self) -> None:
        self.objects: dict[str, int] = {}
        self.deleted: list[str] = []


@pytest.fixture
def bucket(monkeypatch):
    monkeypatch.setattr(settings, "r2_account_id", "acct")
    monkeypatch.setattr(settings, "r2_access_key_id", "AKIAIOSFODNN7EXAMPLE")
    monkeypatch.setattr(
        settings, "r2_secret_access_key", "wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY"
    )
    monkeypatch.setattr(settings, "r2_bucket", "media")
    monkeypatch.setattr(settings, "r2_public_base_url", "https://media.test")
    r2._client.cache_clear()

    fake = Bucket()
    monkeypatch.setattr(r2, "object_size", lambda key: fake.objects.get(key))
    monkeypatch.setattr(r2, "delete_objects", lambda keys: fake.deleted.extend(keys))
    yield fake
    r2._client.cache_clear()


@pytest.fixture
def categories(session: Session):
    session.add(Category(id=1, name="Electronics", slug="electronics"))
    session.commit()


def open_store(client: TestClient, name: str) -> int:
    response = client.post("/api/v1/stores", json={"display_name": name})
    assert response.status_code == 201, response.text
    return response.json()["id"]


def upload(client: TestClient, bucket: Bucket, store_id: int, size: int = 1024) -> str:
    """Do what the browser does: ask for a ticket, then put the bytes in the bucket."""
    response = client.post(
        "/api/v1/uploads/sign",
        json={"store_id": store_id, "content_type": "image/jpeg", "size_bytes": size},
    )
    assert response.status_code == 200, response.text
    key = response.json()["key"]
    bucket.objects[key] = size
    return key


def create(client: TestClient, store_id: int, keys: list[str], **overrides):
    return client.post(
        f"/api/v1/stores/{store_id}/listings", json={**LISTING, "image_keys": keys, **overrides}
    )


# --- many stores per account ------------------------------------------------------------


def test_one_account_can_run_several_stores(make_client, bucket, categories):
    client = make_client("seller@test.io")
    woodwork = open_store(client, "Fern and Oak")
    coffee = open_store(client, "Third Wave Beans")

    assert woodwork != coffee
    assert create(client, woodwork, [upload(client, bucket, woodwork)]).status_code == 201
    assert (
        create(
            client, coffee, [upload(client, bucket, coffee)], title="Single Origin Sampler"
        ).status_code
        == 201
    )

    stores = client.get("/api/v1/stores").json()
    assert [store["display_name"] for store in stores] == ["Fern and Oak", "Third Wave Beans"]
    assert [store["listing_count"] for store in stores] == [1, 1]


def test_listings_are_scoped_to_one_store_not_the_account(make_client, bucket, categories):
    client = make_client("seller@test.io")
    woodwork = open_store(client, "Fern and Oak")
    coffee = open_store(client, "Third Wave Beans")
    create(client, woodwork, [upload(client, bucket, woodwork)])
    create(client, coffee, [upload(client, bucket, coffee)], title="Single Origin Sampler")

    body = client.get(f"/api/v1/stores/{woodwork}/listings").json()

    assert body["total"] == 1
    assert body["items"][0]["title"] == LISTING["title"]
    assert body["items"][0]["store_id"] == woodwork


def test_a_store_name_cannot_repeat_within_one_account(make_client, bucket):
    client = make_client("seller@test.io")
    open_store(client, "Fern and Oak")

    response = client.post("/api/v1/stores", json={"display_name": "Fern and Oak"})

    assert response.status_code == 409


def test_two_accounts_may_share_a_store_name(make_client, bucket):
    first = make_client("one@test.io")
    open_store(first, "Fern and Oak")

    # Namespaced per account, so one seller cannot squat every name.
    second = make_client("two@test.io")
    open_store(second, "Fern and Oak")

    # The slug cannot collide though, because it is a public URL.
    slugs = [
        first.get("/api/v1/stores").json()[0]["slug"],
        second.get("/api/v1/stores").json()[0]["slug"],
    ]
    assert slugs == ["fern-and-oak", "fern-and-oak-2"], slugs


def test_stores_per_account_are_capped(make_client, bucket):
    client = make_client("seller@test.io")
    for index in range(STORES_PER_USER_MAX):
        open_store(client, f"Store {index}")

    response = client.post("/api/v1/stores", json={"display_name": "One Too Many"})

    assert response.status_code == 409


def test_listing_requires_a_store_that_exists(make_client, bucket, categories):
    client = make_client("seller@test.io")

    assert create(client, 999, ["stores/999/x.jpg"]).status_code == 404


# --- the upload cap ---------------------------------------------------------------------


def test_sign_binds_the_size_cap_into_the_signature(make_client, bucket):
    client = make_client("seller@test.io")
    store_id = open_store(client, "Fern and Oak")

    body = client.post(
        "/api/v1/uploads/sign",
        json={"store_id": store_id, "content_type": "image/jpeg", "size_bytes": 4096},
    ).json()

    assert "content-length" in body["upload_url"].lower(), (
        "R2 must reject a body that is not the length we signed for; without "
        "content-length in X-Amz-SignedHeaders the cap is only advisory"
    )
    assert body["key"].startswith(f"stores/{store_id}/")
    assert body["public_url"].endswith(body["key"])


def test_sign_refuses_anything_over_the_cap(make_client, bucket):
    client = make_client("seller@test.io")
    store_id = open_store(client, "Fern and Oak")

    over = client.post(
        "/api/v1/uploads/sign",
        json={
            "store_id": store_id,
            "content_type": "image/jpeg",
            "size_bytes": MAX_UPLOAD_BYTES + 1,
        },
    )
    assert over.status_code == 422

    at_limit = client.post(
        "/api/v1/uploads/sign",
        json={
            "store_id": store_id,
            "content_type": "image/jpeg",
            "size_bytes": MAX_UPLOAD_BYTES,
        },
    )
    assert at_limit.status_code == 200, "the cap itself must still be allowed"


def test_sign_refuses_a_non_image(make_client, bucket):
    client = make_client("seller@test.io")
    store_id = open_store(client, "Fern and Oak")

    response = client.post(
        "/api/v1/uploads/sign",
        json={"store_id": store_id, "content_type": "application/pdf", "size_bytes": 10},
    )

    assert response.status_code == 422


def test_an_object_that_beat_the_cap_is_rejected_and_deleted(
    make_client, bucket, categories, session
):
    """Belt and braces: if the signed length were ever bypassed, the listing still
    refuses the oversized object rather than publishing it."""
    client = make_client("seller@test.io")
    store_id = open_store(client, "Fern and Oak")
    key = upload(client, bucket, store_id)
    bucket.objects[key] = MAX_UPLOAD_BYTES + 5_000

    response = create(client, store_id, [key])

    assert response.status_code == 422
    assert "larger than the upload limit" in response.json()["detail"]
    assert bucket.deleted == [key], "an oversized object should not be left in the bucket"
    assert session.exec(select(Product).where(Product.store_id.is_not(None))).all() == []


def test_listing_needs_an_image_that_was_actually_uploaded(make_client, bucket, categories):
    client = make_client("seller@test.io")
    store_id = open_store(client, "Fern and Oak")
    ticket = client.post(
        "/api/v1/uploads/sign",
        json={"store_id": store_id, "content_type": "image/jpeg", "size_bytes": 1024},
    )

    # Ticket issued, PUT never made.
    response = create(client, store_id, [ticket.json()["key"]])

    assert response.status_code == 422
    assert "not in storage" in response.json()["detail"]


def test_listing_caps_the_number_of_images(make_client, bucket, categories):
    client = make_client("seller@test.io")
    store_id = open_store(client, "Fern and Oak")
    keys = [upload(client, bucket, store_id) for _ in range(7)]

    assert create(client, store_id, keys).status_code == 422
    assert create(client, store_id, keys[:6]).status_code == 201


# --- the ownership boundary -------------------------------------------------------------


def test_a_store_cannot_attach_another_stores_image(make_client, bucket, categories):
    mine = make_client("mine@test.io")
    theirs = make_client("theirs@test.io")
    my_store = open_store(mine, "Fern and Oak")
    their_store = open_store(theirs, "Copycat Goods")
    stolen = upload(theirs, bucket, their_store)

    response = create(mine, my_store, [stolen])

    assert response.status_code == 403, "keys are unguessable, but that is not a permission"


def test_one_sellers_own_stores_do_not_share_images(make_client, bucket, categories):
    """Even inside one account the prefix is per store, so a key from the coffee shop is
    not usable by the woodworking shop."""
    client = make_client("seller@test.io")
    woodwork = open_store(client, "Fern and Oak")
    coffee = open_store(client, "Third Wave Beans")

    response = create(client, woodwork, [upload(client, bucket, coffee)])

    assert response.status_code == 403


def test_signing_requires_a_session(make_client, bucket):
    registered = make_client("seller@test.io")
    store_id = open_store(registered, "Fern and Oak")
    anonymous = TestClient(registered.app)

    response = anonymous.post(
        "/api/v1/uploads/sign",
        json={"store_id": store_id, "content_type": "image/jpeg", "size_bytes": 10},
    )

    assert response.status_code == 401


def test_cannot_sign_an_upload_for_someone_elses_store(make_client, bucket):
    theirs = make_client("theirs@test.io")
    their_store = open_store(theirs, "Copycat Goods")
    mine = make_client("mine@test.io")

    response = mine.post(
        "/api/v1/uploads/sign",
        json={"store_id": their_store, "content_type": "image/jpeg", "size_bytes": 10},
    )

    assert response.status_code == 404


def test_cannot_read_or_write_someone_elses_store(make_client, bucket, categories):
    theirs = make_client("theirs@test.io")
    their_store = open_store(theirs, "Copycat Goods")
    create(theirs, their_store, [upload(theirs, bucket, their_store)])
    mine = make_client("mine@test.io")

    assert mine.get(f"/api/v1/stores/{their_store}/listings").status_code == 404
    assert create(mine, their_store, ["stores/1/whatever.jpg"]).status_code == 404
    assert mine.get("/api/v1/stores").json() == []


def test_deleting_someone_elses_listing_is_a_404(make_client, bucket, categories):
    mine = make_client("mine@test.io")
    theirs = make_client("theirs@test.io")
    my_store = open_store(mine, "Fern and Oak")
    their_store = open_store(theirs, "Copycat Goods")
    listing_id = create(mine, my_store, [upload(mine, bucket, my_store)]).json()["id"]

    # Their own store id, my listing id: the listing still has to be in that store.
    assert theirs.delete(f"/api/v1/stores/{their_store}/listings/{listing_id}").status_code == 404
    assert mine.get(f"/api/v1/stores/{my_store}/listings").json()["total"] == 1


# --- what a listing is, and what delete may not do --------------------------------------


def test_a_listing_becomes_an_ordinary_catalogue_product(make_client, bucket, categories, session):
    client = make_client("seller@test.io")
    store_id = open_store(client, "Fern and Oak")
    key = upload(client, bucket, store_id)

    body = create(
        client,
        store_id,
        [key],
        variants=[
            {"attrs": {"Size": "Small"}, "price_cents": 2499, "stock": 4},
            {
                "attrs": {"Size": "Large"},
                "price_cents": 3999,
                "list_price_cents": 4999,
                "stock": 0,
            },
        ],
    ).json()

    assert body["price_cents"] == 2499, "the card quotes the cheapest variant"
    assert body["stock"] == 4
    assert body["variant_count"] == 2

    product = session.get(Product, body["id"])
    assert product.store_id == store_id
    assert product.bullets == ["Solid walnut", "Oiled finish"], "blank bullets are dropped"
    assert product.images[0].url == f"https://media.test/{key}"
    # Price and stock live on the variant, never on the product.
    assert all(isinstance(variant.price_cents, int) for variant in product.variants)
    assert {variant.attrs["Size"] for variant in product.variants} == {"Small", "Large"}
    assert len({variant.sku for variant in product.variants}) == 2

    # And it is searchable through the same FTS index as the seeded catalogue.
    found = client.get("/api/v1/products", params={"q": "walnut desk tray"}).json()
    assert body["slug"] in [item["slug"] for item in found["items"]]


def test_two_listings_with_the_same_title_get_different_slugs(make_client, bucket, categories):
    client = make_client("seller@test.io")
    store_id = open_store(client, "Fern and Oak")

    first = create(client, store_id, [upload(client, bucket, store_id)]).json()["slug"]
    second = create(client, store_id, [upload(client, bucket, store_id)]).json()["slug"]

    assert first != second
    assert second.startswith(first)


def test_the_pdp_names_the_store(make_client, bucket, categories):
    client = make_client("seller@test.io")
    store_id = open_store(client, "Fern and Oak")
    slug = create(client, store_id, [upload(client, bucket, store_id)]).json()["slug"]

    detail = client.get(f"/api/v1/products/{slug}").json()

    assert detail["sold_by"] == "Fern and Oak"


def test_sold_by_stays_nullable_for_a_storeless_product(catalog, make_client, bucket):
    """The seed now lists everything through a real store, but the column stays nullable:
    a product can outlive the store that listed it, and an order outlives both."""
    client = make_client("shopper@test.io")

    body = client.get("/api/v1/products/widget").json()

    assert body["sold_by"] is None
    assert body["store_slug"] is None


def test_a_sold_listing_cannot_be_deleted(make_client, bucket, categories, session):
    """An order snapshots its line items but still points at the variant row. Deleting
    the listing would break that link, so the listing stays."""
    client = make_client("seller@test.io")
    store_id = open_store(client, "Fern and Oak")
    listing_id = create(client, store_id, [upload(client, bucket, store_id)]).json()["id"]
    variant = session.exec(select(Variant).where(Variant.product_id == listing_id)).first()
    order = Order(
        user_id=1,
        idempotency_key="test-key",
        subtotal_cents=2499,
        shipping_cents=0,
        tax_cents=0,
        total_cents=2499,
    )
    session.add(order)
    session.flush()
    session.add(
        OrderItem(
            order_id=order.id,
            variant_id=variant.id,
            qty=1,
            unit_price_cents=2499,
            title_snapshot="snapshot",
            slug_snapshot="snapshot",
        )
    )
    session.commit()

    response = client.delete(f"/api/v1/stores/{store_id}/listings/{listing_id}")

    assert response.status_code == 409
    assert session.get(Product, listing_id) is not None


def test_deleting_an_unsold_listing_removes_it_and_its_images(
    make_client, bucket, categories, session
):
    client = make_client("seller@test.io")
    store_id = open_store(client, "Fern and Oak")
    key = upload(client, bucket, store_id)
    listing_id = create(client, store_id, [key]).json()["id"]

    assert client.delete(f"/api/v1/stores/{store_id}/listings/{listing_id}").status_code == 204
    assert session.get(Product, listing_id) is None
    assert bucket.deleted == [key], "the bucket should not keep images for a dead listing"
    assert client.get(f"/api/v1/stores/{store_id}/listings").json()["total"] == 0


# --- money at the boundary --------------------------------------------------------------


@pytest.mark.parametrize(
    "variant",
    [
        {"attrs": {}, "price_cents": 0, "stock": 1},
        {"attrs": {}, "price_cents": -500, "stock": 1},
        {"attrs": {}, "price_cents": 1999, "stock": -1},
        {"attrs": {}, "price_cents": 1999, "list_price_cents": 999, "stock": 1},
        {"attrs": {}, "price_cents": 19.99, "stock": 1},
    ],
    ids=["free", "negative", "negative-stock", "was-price-below-price", "fractional-cents"],
)
def test_prices_are_validated_at_the_boundary(make_client, bucket, categories, variant):
    client = make_client("seller@test.io")
    store_id = open_store(client, "Fern and Oak")

    response = create(client, store_id, [upload(client, bucket, store_id)], variants=[variant])

    assert response.status_code == 422


def test_duplicate_options_are_rejected(make_client, bucket, categories):
    client = make_client("seller@test.io")
    store_id = open_store(client, "Fern and Oak")
    same = {"attrs": {"Size": "Small"}, "price_cents": 1999, "stock": 1}

    response = create(client, store_id, [upload(client, bucket, store_id)], variants=[same, same])

    assert response.status_code == 422


def test_uploads_are_unavailable_without_r2_credentials(make_client, bucket, monkeypatch):
    client = make_client("seller@test.io")
    store_id = open_store(client, "Fern and Oak")
    monkeypatch.setattr(settings, "r2_bucket", "")

    assert client.get("/api/v1/uploads/policy").json()["configured"] is False
    response = client.post(
        "/api/v1/uploads/sign",
        json={"store_id": store_id, "content_type": "image/jpeg", "size_bytes": 10},
    )
    assert response.status_code == 503


# --- the public storefront ---------------------------------------------------------------


def test_the_storefront_is_public(make_client, bucket, categories):
    seller = make_client("seller@test.io")
    store_id = open_store(seller, "Fern and Oak")
    create(seller, store_id, [upload(seller, bucket, store_id)])
    slug = seller.get("/api/v1/stores").json()[0]["slug"]
    anonymous = TestClient(seller.app)

    body = anonymous.get(f"/api/v1/stores/{slug}").json()

    assert body["display_name"] == "Fern and Oak"
    assert body["listing_count"] == 1
    # Nothing about who owns it, which is not a shopper's business.
    assert "user_id" not in body
    assert "id" not in body


def test_an_unknown_storefront_is_a_404(make_client, bucket):
    client = make_client("seller@test.io")

    assert client.get("/api/v1/stores/no-such-shop").status_code == 404


def test_the_catalogue_can_be_scoped_to_one_store(make_client, bucket, categories):
    """The storefront grid is the catalogue endpoint with a store filter, not a second
    listing route -- so it inherits sorting, facets and paging."""
    seller = make_client("seller@test.io")
    woodwork = open_store(seller, "Fern and Oak")
    coffee = open_store(seller, "Third Wave Beans")
    create(seller, woodwork, [upload(seller, bucket, woodwork)])
    create(seller, coffee, [upload(seller, bucket, coffee)], title="Single Origin Sampler")
    slug = next(
        store["slug"]
        for store in seller.get("/api/v1/stores").json()
        if store["id"] == woodwork
    )

    scoped = seller.get("/api/v1/products", params={"store": slug}).json()

    assert scoped["total"] == 1
    assert scoped["items"][0]["title"] == LISTING["title"]
    assert scoped["facets"]["brands"], "facets should still come back, scoped to the store"
    # And the unscoped catalogue still has both.
    assert seller.get("/api/v1/products").json()["total"] == 2


def test_an_unknown_store_filter_returns_an_empty_page_not_an_error(make_client, bucket):
    client = make_client("shopper@test.io")

    body = client.get("/api/v1/products", params={"store": "no-such-shop"}).json()

    assert body["total"] == 0
    assert body["items"] == []
