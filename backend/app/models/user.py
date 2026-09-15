from datetime import datetime

from sqlmodel import Field, SQLModel

from app.models.base import utcnow


class User(SQLModel, table=True):
    __tablename__ = "user"

    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str
    name: str = Field(max_length=120)
    is_prime: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utcnow)


class Address(SQLModel, table=True):
    __tablename__ = "address"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    name: str = Field(max_length=120)
    line1: str = Field(max_length=200)
    line2: str | None = Field(default=None, max_length=200)
    city: str = Field(max_length=100)
    state: str = Field(max_length=100)
    postal_code: str = Field(max_length=20)
    country: str = Field(default="US", max_length=2)
    phone: str = Field(max_length=30)
    is_default: bool = Field(default=False)
