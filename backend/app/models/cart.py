from datetime import datetime

from sqlalchemy import CheckConstraint, UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

from app.models.base import utcnow
from app.models.catalog import Variant


class Cart(SQLModel, table=True):
    __tablename__ = "cart"
    __table_args__ = (
        CheckConstraint("(user_id IS NULL) != (token IS NULL)", name="ck_cart_owner"),
    )

    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="user.id", unique=True)
    token: str | None = Field(default=None, unique=True, index=True, max_length=64)
    created_at: datetime = Field(default_factory=utcnow)

    items: list["CartItem"] = Relationship(
        back_populates="cart", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class CartItem(SQLModel, table=True):
    __tablename__ = "cart_item"
    __table_args__ = (
        UniqueConstraint("cart_id", "variant_id", name="uq_cart_item"),
        CheckConstraint("qty > 0", name="ck_cart_item_qty_positive"),
    )

    id: int | None = Field(default=None, primary_key=True)
    cart_id: int = Field(foreign_key="cart.id", index=True)
    variant_id: int = Field(foreign_key="variant.id", index=True)
    qty: int = Field(default=1)
    saved_for_later: bool = Field(default=False)

    cart: Cart | None = Relationship(back_populates="items")
    variant: Variant | None = Relationship()
