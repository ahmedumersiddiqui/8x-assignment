from typing import Literal

from pydantic import BaseModel, Field

Sort = Literal["featured", "price_asc", "price_desc", "rating", "newest"]


class ProductQuery(BaseModel):
    q: str | None = Field(default=None, max_length=120)
    category: str | None = None
    # A storefront slug. Scoping the catalogue query is what makes the store page the
    # same grid, with the same facets and sorting, rather than a second listing endpoint.
    store: str | None = Field(default=None, max_length=140)
    brand: list[str] = Field(default_factory=list)
    min_price: int | None = Field(default=None, ge=0)
    max_price: int | None = Field(default=None, ge=0)
    min_rating: int | None = Field(default=None, ge=1, le=5)
    in_stock: bool = False
    sort: Sort = "featured"
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=24, ge=1, le=48)


class VariantOut(BaseModel):
    id: int
    sku: str
    attrs: dict[str, str]
    price_cents: int
    list_price_cents: int | None
    stock: int


class ProductCard(BaseModel):
    id: int
    slug: str
    title: str
    brand: str
    rating_avg: float
    rating_count: int
    price_cents: int
    list_price_cents: int | None
    image: str | None
    in_stock: bool


class ProductDetail(ProductCard):
    description: str
    bullets: list[str]
    specs: dict[str, str]
    images: list[str]
    variants: list[VariantOut]
    category_slug: str
    delivery_estimate: str
    # Every product has a store now, but the column stays nullable: an order outlives
    # the listing it came from, and so may a product whose store was removed.
    sold_by: str | None = None
    store_slug: str | None = None


class FacetCount(BaseModel):
    value: str
    count: int


class Facets(BaseModel):
    brands: list[FacetCount]
    ratings: list[FacetCount]
    price_min_cents: int
    price_max_cents: int


class SearchResponse(BaseModel):
    items: list[ProductCard]
    total: int
    page: int
    page_size: int
    facets: Facets
    # One date for the whole page: standard delivery is the same promise for every row,
    # so it ships once here rather than repeating on all 24 cards.
    delivery_estimate: str


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    image: str | None = None
    children: list["CategoryOut"] = []
