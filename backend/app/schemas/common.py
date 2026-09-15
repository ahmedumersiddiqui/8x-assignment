from pydantic import BaseModel


class Page[T](BaseModel):
    items: list[T]
    total: int
    page: int
    page_size: int


class ErrorBody(BaseModel):
    detail: str
    code: str | None = None
