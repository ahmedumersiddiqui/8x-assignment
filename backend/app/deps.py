from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from sqlmodel import Session

from app.constants import AUTH_COOKIE, DELIVERY_COOKIE
from app.db import get_session
from app.models import Store, User
from app.security import decode_token

SessionDep = Annotated[Session, Depends(get_session)]


def optional_user(request: Request, session: SessionDep) -> User | None:
    token = request.cookies.get(AUTH_COOKIE)
    if not token:
        return None
    user_id = decode_token(token)
    return session.get(User, user_id) if user_id else None


OptionalUser = Annotated[User | None, Depends(optional_user)]


def current_user(user: OptionalUser) -> User:
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    return user


CurrentUser = Annotated[User, Depends(current_user)]


def owned_store(store_id: int, user: CurrentUser, session: SessionDep) -> Store:
    """The store named in the path, if the caller owns it.

    404 rather than 403 for someone else's store: a store the caller cannot touch and a
    store that does not exist should be indistinguishable from outside.
    """
    store = session.get(Store, store_id)
    if store is None or store.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Store not found")
    return store


OwnedStore = Annotated[Store, Depends(owned_store)]


def delivery_postal_code(request: Request) -> str | None:
    value = (request.cookies.get(DELIVERY_COOKIE) or "").strip()
    return value if value.isdigit() and len(value) == 5 else None


DeliveryPostalCode = Annotated[str | None, Depends(delivery_postal_code)]
