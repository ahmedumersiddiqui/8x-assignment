import secrets

from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.models import Cart, CartItem, Product, User, Variant
from app.schemas.cart import CartLine, CartOut
from app.services.constants import MAX_QTY_PER_LINE


def new_token() -> str:
    return secrets.token_urlsafe(24)


def get_or_create(session: Session, user: User | None, token: str | None) -> Cart:
    if user:
        cart = session.exec(select(Cart).where(Cart.user_id == user.id)).first()
        return cart or _create(session, user_id=user.id)
    if token:
        cart = session.exec(select(Cart).where(Cart.token == token)).first()
        if cart:
            return cart
    return _create(session, token=token or new_token())


def _create(session: Session, **owner) -> Cart:
    cart = Cart(**owner)
    session.add(cart)
    session.commit()
    session.refresh(cart)
    return cart


def merge_guest_cart(session: Session, token: str, user: User) -> None:
    """Guest cart wins on presence, quantities add, cap per line. Guest cart is then dropped."""
    guest = session.exec(select(Cart).where(Cart.token == token)).first()
    if not guest:
        return
    target = get_or_create(session, user, None)
    if guest.id == target.id:
        return
    existing = {item.variant_id: item for item in target.items}
    for item in guest.items:
        if item.variant_id in existing:
            merged = existing[item.variant_id]
            merged.qty = min(merged.qty + item.qty, MAX_QTY_PER_LINE)
            session.add(merged)
        else:
            session.add(
                CartItem(
                    cart_id=target.id,
                    variant_id=item.variant_id,
                    qty=item.qty,
                    saved_for_later=item.saved_for_later,
                )
            )
    session.delete(guest)
    session.commit()


def lines(
    session: Session, cart: Cart, *, saved: bool = False
) -> list[tuple[CartItem, Variant, Product, str | None]]:
    rows = session.exec(
        select(CartItem, Variant, Product)
        .join(Variant, Variant.id == CartItem.variant_id)
        .join(Product, Product.id == Variant.product_id)
        .where(CartItem.cart_id == cart.id, CartItem.saved_for_later == saved)
        .options(selectinload(Product.images))
        .order_by(CartItem.id)
    ).all()
    return [(i, v, p, p.images[0].url if p.images else None) for i, v, p in rows]


def _to_lines(session: Session, cart: Cart, *, saved: bool) -> list[CartLine]:
    return [
        CartLine(
            id=item.id,
            variant_id=variant.id,
            qty=item.qty,
            title=product.title,
            slug=product.slug,
            image=image,
            attrs=variant.attrs,
            unit_price_cents=variant.price_cents,
            line_total_cents=variant.price_cents * item.qty,
            stock=variant.stock,
        )
        for item, variant, product, image in lines(session, cart, saved=saved)
    ]


def serialize(session: Session, cart: Cart) -> CartOut:
    items = _to_lines(session, cart, saved=False)
    return CartOut(
        items=items,
        saved_items=_to_lines(session, cart, saved=True),
        subtotal_cents=sum(line.line_total_cents for line in items),
        item_count=sum(line.qty for line in items),
    )
