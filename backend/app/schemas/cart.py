from pydantic import BaseModel, Field


class CartItemIn(BaseModel):
    variant_id: int
    qty: int = Field(default=1, ge=1, le=20)


class CartItemPatch(BaseModel):
    qty: int = Field(ge=1, le=20)


class CartLine(BaseModel):
    id: int
    variant_id: int
    qty: int
    title: str
    slug: str
    image: str | None
    attrs: dict[str, str]
    unit_price_cents: int
    line_total_cents: int
    stock: int


class CartOut(BaseModel):
    items: list[CartLine]
    saved_items: list[CartLine]
    subtotal_cents: int
    item_count: int
