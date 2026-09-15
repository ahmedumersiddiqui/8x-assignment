from datetime import datetime

from sqlalchemy import CheckConstraint, Column, UniqueConstraint
from sqlalchemy.types import JSON
from sqlmodel import Field, Relationship, SQLModel

from app.models.base import utcnow


class Order(SQLModel, table=True):
    __tablename__ = "order"
    __table_args__ = (UniqueConstraint("user_id", "idempotency_key", name="uq_order_idempotency"),)

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    idempotency_key: str = Field(max_length=64)
    status: str = Field(default="placed", max_length=20)
    subtotal_cents: int
    shipping_cents: int
    tax_cents: int
    total_cents: int
    address_snapshot: dict = Field(default_factory=dict, sa_column=Column(JSON))
    delivery_option: str = Field(default="standard", max_length=20)
    delivery_estimate: str = Field(default="", max_length=40)
    placed_at: datetime = Field(default_factory=utcnow)

    items: list["OrderItem"] = Relationship(
        back_populates="order", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class OrderItem(SQLModel, table=True):
    """Every field here is a snapshot. An order never changes when a product does."""

    __tablename__ = "order_item"
    __table_args__ = (CheckConstraint("qty > 0", name="ck_order_item_qty_positive"),)

    id: int | None = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="order.id", index=True)
    variant_id: int = Field(foreign_key="variant.id")
    qty: int
    unit_price_cents: int
    title_snapshot: str = Field(max_length=300)
    image_snapshot: str | None = Field(default=None, max_length=500)
    slug_snapshot: str = Field(default="", max_length=200)

    order: Order | None = Relationship(back_populates="items")
