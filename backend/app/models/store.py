from datetime import datetime

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, SQLModel

from app.models.base import utcnow


class Store(SQLModel, table=True):
    """A storefront. One user may run several, and every listing belongs to exactly one.

    Kept separate from User so the public "Sold by" name is the shop's, not the person's,
    and so a seller can keep unrelated lines of business apart.
    """

    __tablename__ = "store"
    # Two shops with the same name under one account would be indistinguishable in the
    # store picker, which is the only place the seller chooses between them.
    __table_args__ = (UniqueConstraint("user_id", "display_name", name="uq_store_name_per_user"),)

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    display_name: str = Field(max_length=120)
    # Unique across every account, not just within one: this is the public storefront URL.
    # Two sellers may legitimately pick the same shop name, so the slug carries a suffix.
    slug: str = Field(unique=True, index=True, max_length=140)
    created_at: datetime = Field(default_factory=utcnow)
