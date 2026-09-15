import pytest
from sqlmodel import select

from app.models import Cart, CartItem, User
from app.services.cart import merge_guest_cart

ADDRESS = {
    "name": "Ada Lovelace",
    "line1": "1 Analytical Way",
    "city": "Seattle",
    "state": "WA",
    "postal_code": "98101",
    "country": "US",
    "phone": "5550001111",
}


@pytest.fixture
def alice(make_client):
    return make_client("alice@test.com")


def add(client, variant_id: int, qty: int = 1) -> int:
    response = client.post("/api/v1/cart/items", json={"variant_id": variant_id, "qty": qty})
    assert response.status_code == 201, response.text
    return response.json()["items"][-1]["id"]


def test_saving_moves_a_line_out_of_the_totals(alice, catalog):
    item_id = add(alice, catalog["SKU-A"], 2)
    add(alice, catalog["SKU-B"], 1)

    cart = alice.post(f"/api/v1/cart/items/{item_id}/save").json()

    assert [line["id"] for line in cart["saved_items"]] == [item_id]
    assert item_id not in [line["id"] for line in cart["items"]]
    assert cart["item_count"] == 1
    assert cart["subtotal_cents"] == 500


def test_a_saved_line_is_not_bought_and_survives_checkout(alice, catalog):
    saved_id = add(alice, catalog["SKU-A"], 2)
    add(alice, catalog["SKU-B"], 1)
    alice.post(f"/api/v1/cart/items/{saved_id}/save")

    response = alice.post(
        "/api/v1/checkout",
        json={"address": ADDRESS, "delivery_option": "standard", "idempotency_key": "saved-key-1"},
    )
    assert response.status_code == 201, response.text
    order = response.json()

    assert len(order["items"]) == 1
    assert order["subtotal_cents"] == 500

    cart = alice.get("/api/v1/cart").json()
    assert cart["items"] == []
    assert [line["id"] for line in cart["saved_items"]] == [saved_id]


def test_moving_back_restores_it_to_the_totals(alice, catalog):
    item_id = add(alice, catalog["SKU-A"], 2)
    alice.post(f"/api/v1/cart/items/{item_id}/save")

    cart = alice.post(f"/api/v1/cart/items/{item_id}/move-to-cart").json()

    assert cart["saved_items"] == []
    assert cart["item_count"] == 2
    assert cart["subtotal_cents"] == 1999 * 2


def test_a_saved_line_is_still_ownership_checked(alice, catalog, make_client):
    item_id = add(alice, catalog["SKU-A"])
    bob = make_client("bob@test.com")

    assert bob.post(f"/api/v1/cart/items/{item_id}/save").status_code == 404
    assert bob.post(f"/api/v1/cart/items/{item_id}/move-to-cart").status_code == 404


def test_merging_a_guest_cart_keeps_the_saved_flag(session, catalog):
    user = User(email="c@test.com", name="C", password_hash="x")
    session.add(user)
    session.commit()
    guest = Cart(token="guest")
    mine = Cart(user_id=user.id)
    session.add_all([guest, mine])
    session.commit()
    session.add(
        CartItem(cart_id=guest.id, variant_id=catalog["SKU-A"], qty=1, saved_for_later=True)
    )
    session.commit()

    merge_guest_cart(session, "guest", user)

    merged = session.exec(select(CartItem).where(CartItem.cart_id == mine.id)).all()
    assert [(item.variant_id, item.saved_for_later) for item in merged] == [
        (catalog["SKU-A"], True)
    ]
