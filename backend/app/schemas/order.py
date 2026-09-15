from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class AddressIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    line1: str = Field(min_length=1, max_length=200)
    line2: str | None = Field(default=None, max_length=200)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    postal_code: str = Field(min_length=3, max_length=20)
    country: str = Field(default="US", min_length=2, max_length=2)
    phone: str = Field(min_length=5, max_length=30)


DeliveryOption = Literal["standard", "express"]


class CheckoutIn(BaseModel):
    """No prices here on purpose. The server recalculates every amount from the DB."""

    address: AddressIn
    delivery_option: DeliveryOption = "standard"
    idempotency_key: str = Field(min_length=8, max_length=64)


class TotalsOut(BaseModel):
    """What checkout will charge, quoted before placing. Same code path as place_order."""

    item_count: int
    subtotal_cents: int
    shipping_cents: int
    tax_cents: int
    total_cents: int
    delivery_estimate: str


class OrderLineOut(BaseModel):
    variant_id: int
    qty: int
    unit_price_cents: int
    title_snapshot: str
    image_snapshot: str | None
    slug_snapshot: str


class OrderOut(BaseModel):
    id: int
    status: str
    subtotal_cents: int
    shipping_cents: int
    tax_cents: int
    total_cents: int
    address_snapshot: dict
    delivery_option: str
    delivery_estimate: str
    placed_at: datetime
    items: list[OrderLineOut]
