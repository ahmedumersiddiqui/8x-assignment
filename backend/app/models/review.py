from datetime import datetime

from sqlalchemy import CheckConstraint, UniqueConstraint
from sqlmodel import Field, SQLModel

from app.models.base import utcnow


class Review(SQLModel, table=True):
    __tablename__ = "review"
    __table_args__ = (
        UniqueConstraint("product_id", "user_id", name="uq_review_one_per_user"),
        CheckConstraint("rating BETWEEN 1 AND 5", name="ck_review_rating_range"),
    )

    id: int | None = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.id", index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    rating: int
    title: str = Field(max_length=200)
    body: str = ""
    author_name: str = Field(default="", max_length=120)
    verified_purchase: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utcnow)
