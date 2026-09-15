from datetime import UTC, datetime, timedelta

import bcrypt
import jwt
from fastapi import Response

from app.config import settings
from app.constants import JWT_ALGORITHM


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_token(user_id: int) -> str:
    expires = datetime.now(UTC) + timedelta(hours=settings.jwt_ttl_hours)
    return jwt.encode({"sub": str(user_id), "exp": expires}, settings.jwt_secret, JWT_ALGORITHM)


def decode_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[JWT_ALGORITHM])
        return int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, ValueError):
        return None


def set_cookie(response: Response, name: str, value: str, max_age: int) -> None:
    response.set_cookie(
        name,
        value,
        max_age=max_age,
        httponly=True,
        samesite=settings.cookie_samesite,
        secure=settings.cookie_secure,
        path="/",
    )
