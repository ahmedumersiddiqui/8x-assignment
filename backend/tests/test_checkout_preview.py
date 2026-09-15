"""The quote must equal the charge. A summary that disagrees with the order is a lie."""

ADDRESS = {
    "name": "Ada Lovelace",
    "line1": "1 Analytical Way",
    "city": "Seattle",
    "state": "WA",
    "postal_code": "98101",
    "country": "US",
    "phone": "5550001111",
}

MONEY = ("subtotal_cents", "shipping_cents", "tax_cents", "total_cents")


def preview(client, delivery: str = "standard", postal_code: str = ADDRESS["postal_code"]):
    response = client.get(
        "/api/v1/checkout/preview",
        params={"delivery_option": delivery, "postal_code": postal_code},
    )
    assert response.status_code == 200, response.text
    return response.json()


def test_preview_matches_what_checkout_actually_charges(make_client, catalog):
    client = make_client("ada@test.com")
    client.post("/api/v1/cart/items", json={"variant_id": catalog["SKU-A"], "qty": 3})

    quoted = preview(client, "express")
    assert quoted["item_count"] == 3

    placed = client.post(
        "/api/v1/checkout",
        json={"address": ADDRESS, "delivery_option": "express", "idempotency_key": "quote-key-1"},
    )
    assert placed.status_code == 201, placed.text
    charged = placed.json()

    assert [quoted[field] for field in MONEY] == [charged[field] for field in MONEY]
    assert quoted["delivery_estimate"] == charged["delivery_estimate"]


def test_preview_reprices_when_the_delivery_option_changes(make_client, catalog):
    client = make_client("grace@test.com")
    client.post("/api/v1/cart/items", json={"variant_id": catalog["SKU-A"], "qty": 3})

    standard, express = preview(client, "standard"), preview(client, "express")

    # $59.97 clears the $35 free-shipping threshold, so standard is free and express is not.
    assert standard["shipping_cents"] == 0
    assert express["shipping_cents"] > 0
    assert express["total_cents"] > standard["total_cents"]


def test_preview_of_an_empty_cart_is_all_zeroes(make_client, catalog):
    quoted = preview(make_client("empty@test.com"))
    assert quoted["item_count"] == 0
    assert [quoted[field] for field in MONEY] == [0, 0, 0, 0]


def test_preview_requires_a_signed_in_user(make_client, catalog):
    from fastapi.testclient import TestClient

    from app.main import app

    assert TestClient(app).get("/api/v1/checkout/preview").status_code == 401


def test_preview_falls_back_to_the_chosen_delivery_location(make_client, catalog):
    client = make_client("zoe@test.com")
    client.post("/api/v1/cart/items", json={"variant_id": catalog["SKU-A"], "qty": 1})

    near = client.get("/api/v1/checkout/preview", params={"postal_code": "10001"}).json()

    client.cookies.set("delivery_postal_code", "98101")
    far = client.get("/api/v1/checkout/preview").json()

    assert near["delivery_estimate"] != far["delivery_estimate"]
    assert near["total_cents"] == far["total_cents"]
