import pytest

from app.models import Product

ADDRESS = {
    "name": "Ada Lovelace",
    "line1": "1 Analytical Way",
    "city": "Seattle",
    "state": "WA",
    "postal_code": "98101",
    "country": "US",
    "phone": "5550001111",
}


def reviews_url(slug: str = "widget") -> str:
    return f"/api/v1/products/{slug}/reviews"


@pytest.fixture
def users(make_client):
    return make_client("alice@test.com"), make_client("bob@test.com")


def test_anonymous_can_read_but_not_write(users, catalog, session):
    alice, _ = users
    assert alice.get(reviews_url()).json()["total"] == 0

    alice.post("/api/v1/auth/logout")
    alice.cookies.clear()
    assert alice.post(reviews_url(), json={"rating": 5}).status_code == 401
    assert alice.get(reviews_url()).status_code == 200


def test_a_second_review_edits_the_first_rather_than_stacking(users, catalog):
    alice, _ = users
    first = alice.post(reviews_url(), json={"rating": 5, "title": "Great"}).json()
    second = alice.post(reviews_url(), json={"rating": 2, "title": "Changed my mind"}).json()

    assert first["id"] == second["id"]
    page = alice.get(reviews_url()).json()
    assert page["total"] == 1
    assert page["mine"]["title"] == "Changed my mind"


def test_the_product_aggregate_is_derived_from_the_reviews(users, catalog, session):
    alice, bob = users
    alice.post(reviews_url(), json={"rating": 5})
    bob.post(reviews_url(), json={"rating": 2})

    session.expire_all()
    product = session.get(Product, 1)
    assert product.rating_count == 2
    assert product.rating_avg == 3.5

    summary = alice.get(reviews_url()).json()["summary"]
    assert summary == {
        "average": 3.5,
        "count": 2,
        "histogram": {"5": 1, "4": 0, "3": 0, "2": 1, "1": 0},
    }


def test_a_rating_with_no_words_is_allowed(users, catalog):
    alice, _ = users
    review = alice.post(reviews_url(), json={"rating": 4}).json()
    assert (review["rating"], review["title"], review["body"]) == (4, "", "")


@pytest.mark.parametrize("rating", [0, 6, -1])
def test_ratings_outside_one_to_five_are_rejected(users, catalog, rating):
    alice, _ = users
    assert alice.post(reviews_url(), json={"rating": rating}).status_code == 422


def test_verified_purchase_is_set_only_for_a_buyer(users, catalog):
    alice, bob = users
    alice.post("/api/v1/cart/items", json={"variant_id": catalog["SKU-A"], "qty": 1})
    alice.post(
        "/api/v1/checkout",
        json={"address": ADDRESS, "delivery_option": "standard", "idempotency_key": "verify-1"},
    )

    assert alice.post(reviews_url(), json={"rating": 5}).json()["verified_purchase"] is True
    assert bob.post(reviews_url(), json={"rating": 5}).json()["verified_purchase"] is False


def test_reviews_can_be_filtered_by_star(users, catalog):
    alice, bob = users
    alice.post(reviews_url(), json={"rating": 5})
    bob.post(reviews_url(), json={"rating": 1})

    assert alice.get(reviews_url(), params={"rating": 5}).json()["total"] == 1
    assert alice.get(reviews_url(), params={"rating": 3}).json()["items"] == []


def test_reviewing_a_missing_product_is_a_404(users, catalog):
    alice, _ = users
    assert alice.post(reviews_url("nope"), json={"rating": 5}).status_code == 404
    assert alice.get(reviews_url("nope")).status_code == 404
