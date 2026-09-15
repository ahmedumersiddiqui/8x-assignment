from datetime import datetime
from typing import Optional

from sqlalchemy import CheckConstraint, Column, Index
from sqlalchemy.types import JSON
from sqlmodel import Field, Relationship, SQLModel

from app.models.base import utcnow
from app.models.store import Store


class Category(SQLModel, table=True):
    __tablename__ = "category"

    id: int | None = Field(default=None, primary_key=True)
    parent_id: int | None = Field(default=None, foreign_key="category.id", index=True)
    name: str = Field(max_length=120)
    slug: str = Field(unique=True, index=True, max_length=140)


class Product(SQLModel, table=True):
    __tablename__ = "product"
    __table_args__ = (Index("ix_product_category_rating", "category_id", "rating_avg"),)

    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(unique=True, index=True, max_length=200)
    title: str = Field(max_length=300)
    brand: str = Field(index=True, max_length=120)
    category_id: int = Field(foreign_key="category.id", index=True)
    # NULL means the house catalogue -- everything the seed writes. A value means some
    # store listed it, and only that store's owner may edit or remove it.
    store_id: int | None = Field(default=None, foreign_key="store.id", index=True)
    description: str = ""
    bullets: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    specs: dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    rating_avg: float = Field(default=0.0)
    rating_count: int = Field(default=0)
    created_at: datetime = Field(default_factory=utcnow)

    images: list["ProductImage"] = Relationship(
        back_populates="product",
        sa_relationship_kwargs={"order_by": "ProductImage.position", "cascade": "all, delete"},
    )
    variants: list["Variant"] = Relationship(
        back_populates="product", sa_relationship_kwargs={"cascade": "all, delete"}
    )
    store: Optional["Store"] = Relationship()


class ProductImage(SQLModel, table=True):
    __tablename__ = "product_image"

    id: int | None = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.id", index=True)
    # Wide enough for a generated data: URI, which is what the seed writes.
    url: str = Field(max_length=4000)
    position: int = Field(default=0)

    product: Product | None = Relationship(back_populates="images")


class Variant(SQLModel, table=True):
    __tablename__ = "variant"
    __table_args__ = (
        CheckConstraint("stock >= 0", name="ck_variant_stock_non_negative"),
        CheckConstraint("price_cents > 0", name="ck_variant_price_positive"),
    )

    id: int | None = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.id", index=True)
    sku: str = Field(unique=True, index=True, max_length=64)
    attrs: dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    price_cents: int
    list_price_cents: int | None = None
    stock: int = Field(default=0)

    product: Product | None = Relationship(back_populates="variants")
