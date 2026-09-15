from datetime import datetime

from pydantic import BaseModel, Field, field_validator, model_validator

from app.services.constants import (
    ALLOWED_IMAGE_TYPES,
    MAX_IMAGES_PER_LISTING,
    MAX_UPLOAD_BYTES,
    MAX_VARIANTS_PER_LISTING,
)

# A listing priced above this is almost certainly a units mistake (dollars typed into a
# cents field). Rejecting it at the boundary beats a $4,999,900.00 tile in the grid.
MAX_PRICE_CENTS = 5_000_000
MAX_STOCK = 100_000


class StoreCreate(BaseModel):
    display_name: str = Field(min_length=2, max_length=120)

    @field_validator("display_name")
    @classmethod
    def _trim(cls, value: str) -> str:
        trimmed = value.strip()
        if len(trimmed) < 2:
            raise ValueError("Store name must be at least 2 characters")
        return trimmed


class StoreOut(BaseModel):
    id: int
    display_name: str
    slug: str
    created_at: datetime
    listing_count: int = 0


class StorefrontOut(BaseModel):
    """The public face of a store. No user id, no counts a shopper cannot already see."""

    display_name: str
    slug: str
    created_at: datetime
    listing_count: int


class UploadPolicy(BaseModel):
    """Lets the sell screen render the cap, the accepted types and the not-configured
    notice without hardcoding any of them in the client."""

    configured: bool
    max_bytes: int = MAX_UPLOAD_BYTES
    max_images: int = MAX_IMAGES_PER_LISTING
    allowed_types: list[str] = sorted(ALLOWED_IMAGE_TYPES)


class UploadTicketIn(BaseModel):
    # Images are stored under the store's own prefix, so the ticket has to say which one.
    store_id: int
    content_type: str
    size_bytes: int = Field(gt=0, le=MAX_UPLOAD_BYTES)

    @field_validator("content_type")
    @classmethod
    def _allowed(cls, value: str) -> str:
        if value not in ALLOWED_IMAGE_TYPES:
            raise ValueError(f"Images must be one of: {', '.join(sorted(ALLOWED_IMAGE_TYPES))}")
        return value


class UploadTicketOut(BaseModel):
    upload_url: str
    key: str
    # Where the image will be readable once the PUT succeeds, so the form can preview the
    # real URL rather than a local blob it would have to revoke later.
    public_url: str
    expires_in: int


class VariantIn(BaseModel):
    """One purchasable option. Price and stock live here, never on the listing."""

    attrs: dict[str, str] = Field(default_factory=dict)
    price_cents: int = Field(gt=0, le=MAX_PRICE_CENTS)
    list_price_cents: int | None = Field(default=None, gt=0, le=MAX_PRICE_CENTS)
    stock: int = Field(ge=0, le=MAX_STOCK)

    @model_validator(mode="after")
    def _list_price_is_a_discount(self):
        if self.list_price_cents is not None and self.list_price_cents <= self.price_cents:
            raise ValueError("Was-price must be higher than the selling price")
        return self


class ListingCreate(BaseModel):
    title: str = Field(min_length=3, max_length=300)
    brand: str = Field(min_length=1, max_length=120)
    category_slug: str = Field(min_length=1, max_length=140)
    description: str = Field(default="", max_length=4000)
    bullets: list[str] = Field(default_factory=list, max_length=6)
    image_keys: list[str] = Field(min_length=1, max_length=MAX_IMAGES_PER_LISTING)
    variants: list[VariantIn] = Field(min_length=1, max_length=MAX_VARIANTS_PER_LISTING)

    @field_validator("bullets")
    @classmethod
    def _drop_blanks(cls, value: list[str]) -> list[str]:
        return [bullet.strip()[:200] for bullet in value if bullet.strip()]

    @model_validator(mode="after")
    def _distinct(self):
        if len(set(self.image_keys)) != len(self.image_keys):
            raise ValueError("The same image was attached twice")
        # Two variants with identical options would render as duplicate rows in the buy
        # box with no way to tell them apart.
        options = [tuple(sorted(variant.attrs.items())) for variant in self.variants]
        if len(set(options)) != len(options):
            raise ValueError("Two options have the same values")
        return self


class ListingOut(BaseModel):
    id: int
    store_id: int
    slug: str
    title: str
    brand: str
    image: str | None
    price_cents: int
    list_price_cents: int | None
    stock: int
    variant_count: int
    rating_avg: float
    rating_count: int
    created_at: datetime
