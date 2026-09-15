from fastapi import APIRouter, HTTPException, Request, Response, status
from sqlmodel import Session

from app.constants import CART_COOKIE, CART_COOKIE_MAX_AGE_SECONDS
from app.deps import OptionalUser, SessionDep
from app.models import Cart, CartItem, User, Variant
from app.schemas.cart import CartItemIn, CartItemPatch, CartOut
from app.security import set_cookie
from app.services.cart import get_or_create, serialize
from app.services.constants import MAX_QTY_PER_LINE

router = APIRouter(prefix="/cart", tags=["cart"])


def resolve(request: Request, response: Response, session: Session, user: User | None) -> Cart:
    cart = get_or_create(session, user, request.cookies.get(CART_COOKIE))
    if cart.token and not user:
        set_cookie(response, CART_COOKIE, cart.token, CART_COOKIE_MAX_AGE_SECONDS)
    return cart


def _owned_item(session: Session, cart: Cart, item_id: int) -> CartItem:
    item = session.get(CartItem, item_id)
    if not item or item.cart_id != cart.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Cart item not found")
    return item


@router.get("", response_model=CartOut)
def get_cart(request: Request, response: Response, session: SessionDep, user: OptionalUser):
    return serialize(session, resolve(request, response, session, user))


@router.post("/items", response_model=CartOut, status_code=status.HTTP_201_CREATED)
def add_item(
    body: CartItemIn,
    request: Request,
    response: Response,
    session: SessionDep,
    user: OptionalUser,
):
    variant = session.get(Variant, body.variant_id)
    if not variant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Variant not found")
    cart = resolve(request, response, session, user)
    existing = next((i for i in cart.items if i.variant_id == variant.id), None)
    if existing:
        existing.qty = min(existing.qty + body.qty, MAX_QTY_PER_LINE)
        session.add(existing)
    else:
        session.add(CartItem(cart_id=cart.id, variant_id=variant.id, qty=body.qty))
    session.commit()
    return serialize(session, cart)


@router.patch("/items/{item_id}", response_model=CartOut)
def update_item(
    item_id: int,
    body: CartItemPatch,
    request: Request,
    response: Response,
    session: SessionDep,
    user: OptionalUser,
):
    cart = resolve(request, response, session, user)
    item = _owned_item(session, cart, item_id)
    item.qty = body.qty
    session.add(item)
    session.commit()
    return serialize(session, cart)


@router.post("/items/{item_id}/save", response_model=CartOut)
def save_for_later(
    item_id: int,
    request: Request,
    response: Response,
    session: SessionDep,
    user: OptionalUser,
):
    return _set_saved(item_id, True, request, response, session, user)


@router.post("/items/{item_id}/move-to-cart", response_model=CartOut)
def move_to_cart(
    item_id: int,
    request: Request,
    response: Response,
    session: SessionDep,
    user: OptionalUser,
):
    return _set_saved(item_id, False, request, response, session, user)


def _set_saved(
    item_id: int,
    saved: bool,
    request: Request,
    response: Response,
    session: Session,
    user: User | None,
) -> CartOut:
    cart = resolve(request, response, session, user)
    item = _owned_item(session, cart, item_id)
    item.saved_for_later = saved
    session.add(item)
    session.commit()
    return serialize(session, cart)


@router.delete("/items/{item_id}", response_model=CartOut)
def remove_item(
    item_id: int,
    request: Request,
    response: Response,
    session: SessionDep,
    user: OptionalUser,
):
    cart = resolve(request, response, session, user)
    session.delete(_owned_item(session, cart, item_id))
    session.commit()
    return serialize(session, cart)
