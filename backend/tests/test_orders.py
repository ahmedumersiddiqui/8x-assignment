"""Two users, two orders. The things that must hold across an account boundary."""

import pytest

from app.models import Variant

ADDRESS = {
    "name": "Ada Lovelace",
    "line1": "1 Analytical Way",
    "city": "Seattle",
    "state": "WA",
    "postal_code": "98101",
    "country": "US",
    "phone": "5550001111",
}


def checkout(client, key: str, delivery: str = "standard"):
    return client.post(
        "/api/v1/checkout",
        json={"address": ADDRESS, "delivery_option": delivery, "idempotency_key": key},
    )


def add(client, variant_id: int, qty: int = 1):
    response = client.post("/api/v1/cart/items", json={"variant_id": variant_id, "qty": qty})
    assert response.status_code == 201, response.text
    return response.json()


@pytest.fixture
def users(make_client):
    return make_client("alice@test.com"), make_client("bob@test.com")


def test_each_user_only_ever_sees_their_own_order(users, catalog):
    alice, bob = users
    add(alice, catalog["SKU-A"], 2)
    add(bob, catalog["SKU-A"], 1)

    alice_order = checkout(alice, "alice-key-0001").json()
    bob_order = checkout(bob, "bob-key-0001").json()
    assert alice_order["id"] != bob_order["id"]

    assert [o["id"] for o in alice.get("/api/v1/orders").json()["items"]] == [alice_order["id"]]
    assert [o["id"] for o in bob.get("/api/v1/orders").json()["items"]] == [bob_order["id"]]

    # Missing and not-yours must be indistinguishable, or the 404 leaks which ids exist.
    assert alice.get(f"/api/v1/orders/{bob_order['id']}").status_code == 404
    assert alice.get("/api/v1/orders/999999").status_code == 404
    assert bob.get(f"/api/v1/orders/{alice_order['id']}").status_code == 404


def test_idempotency_key_is_scoped_to_the_user(users, catalog):
    alice, bob = users
    add(alice, catalog["SKU-A"])
    add(bob, catalog["SKU-A"])

    first = checkout(alice, "shared-key").json()
    second = checkout(bob, "shared-key").json()
    assert first["id"] != second["id"]

    add(alice, catalog["SKU-A"])
    assert checkout(alice, "shared-key").json()["id"] == first["id"]


def test_totals_are_recalculated_server_side_not_sent_by_the_client(users, catalog):
    alice, _ = users
    add(alice, catalog["SKU-A"], 3)
    order = checkout(alice, "totals-key", delivery="express").json()

    assert order["subtotal_cents"] == 1999 * 3
    assert order["shipping_cents"] == 1299
    assert order["tax_cents"] == 1999 * 3 * 825 // 10_000
    assert order["total_cents"] == (
        order["subtotal_cents"] + order["shipping_cents"] + order["tax_cents"]
    )


def test_order_does_not_change_when_the_product_later_does(users, catalog, session):
    alice, _ = users
    add(alice, catalog["SKU-A"], 1)
    order_id = checkout(alice, "snapshot-key").json()["id"]

    variant = session.get(Variant, catalog["SKU-A"])
    variant.price_cents = 999_99
    session.add(variant)
    session.commit()

    line = alice.get(f"/api/v1/orders/{order_id}").json()["items"][0]
    assert line["unit_price_cents"] == 1999
    assert line["title_snapshot"] == "Acme Widget"


def test_second_user_loses_the_last_unit_and_is_told_which_line(users, catalog):
    alice, bob = users
    add(alice, catalog["SKU-B"], 1)
    add(bob, catalog["SKU-B"], 1)

    assert checkout(alice, "race-alice").status_code == 201
    conflict = checkout(bob, "race-bob")
    assert conflict.status_code == 409
    assert "SKU-B" in conflict.json()["detail"]
    # The failed checkout must leave bob's cart intact, not half-consumed.
    assert bob.get("/api/v1/cart").json()["item_count"] == 1


def test_checkout_empties_the_cart_and_decrements_stock(users, catalog, session):
    alice, _ = users
    add(alice, catalog["SKU-A"], 4)
    assert checkout(alice, "stock-key").status_code == 201

    assert alice.get("/api/v1/cart").json()["items"] == []
    session.expire_all()
    assert session.get(Variant, catalog["SKU-A"]).stock == 6


def test_orders_require_authentication(catalog, make_client):
    anonymous = make_client("carol@test.com")
    anonymous.post("/api/v1/auth/logout")
    anonymous.cookies.clear()
    assert anonymous.get("/api/v1/orders").status_code == 401
    assert anonymous.get("/api/v1/orders/1").status_code == 401
