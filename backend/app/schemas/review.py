from datetime import datetime

from pydantic import BaseModel, Field


class ReviewIn(BaseModel):
    rating: int = Field(ge=1, le=5)
    title: str = Field(default="", max_length=200)
    body: str = Field(default="", max_length=4000)


class ReviewOut(BaseModel):
    id: int
    rating: int
    title: str
    body: str
    author_name: str
    verified_purchase: bool
    created_at: datetime
    is_mine: bool = False


class RatingSummary(BaseModel):
    average: float
    count: int
    histogram: dict[str, int]


class ReviewPage(BaseModel):
    items: list[ReviewOut]
    total: int
    page: int
    page_size: int
    summary: RatingSummary
    mine: ReviewOut | None = None
