from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.cache import bump_catalog_version
from app.models import Cart, Order, OrderItem, User
from app.schemas.order import CheckoutIn
from app.services.cart import lines
from app.services.constants import ORDER_STATUS_PLACED
from app.services.pricing import Line, compute_totals, delivery_estimate
from app.services.stock import reserve


class EmptyCart(Exception):
    pass


class InsufficientStock(Exception):
    def __init__(self, title: str, sku: str) -> None:
        super().__init__(f"{title} ({sku}) is out of stock")
        self.title, self.sku = title, sku


def _existing(session: Session, user: User, key: str) -> Order | None:
    return session.exec(
        select(Order).where(Order.user_id == user.id, Order.idempotency_key == key)
    ).first()


def place_order(session: Session, user: User, cart: Cart, body: CheckoutIn) -> Order:
    """One transaction: reserve stock, snapshot prices, write the order, empty the cart.

    Amounts are recalculated here from current DB prices. The request body carries no money.
    """
    already = _existing(session, user, body.idempotency_key)
    if already:
        return already

    rows = lines(session, cart)
    if not rows:
        raise EmptyCart

    for item, variant, product, _ in rows:
        if not reserve(session, variant.id, item.qty):
            session.rollback()
            raise InsufficientStock(product.title, variant.sku)

    totals = compute_totals(
        [Line(v.price_cents, i.qty) for i, v, _, _ in rows], body.delivery_option, user.is_prime
    )
    order = Order(
        user_id=user.id,
        idempotency_key=body.idempotency_key,
        status=ORDER_STATUS_PLACED,
        subtotal_cents=totals.subtotal_cents,
        shipping_cents=totals.shipping_cents,
        tax_cents=totals.tax_cents,
        total_cents=totals.total_cents,
        address_snapshot=body.address.model_dump(),
        delivery_option=body.delivery_option,
        delivery_estimate=delivery_estimate(body.delivery_option, body.address.postal_code),
    )
    session.add(order)
    session.flush()

    for item, variant, product, image in rows:
        session.add(
            OrderItem(
                order_id=order.id,
                variant_id=variant.id,
                qty=item.qty,
                unit_price_cents=variant.price_cents,
                title_snapshot=product.title,
                image_snapshot=image,
                slug_snapshot=product.slug,
            )
        )
        session.delete(item)

    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        duplicate = _existing(session, user, body.idempotency_key)
        if duplicate:
            return duplicate
        raise

    bump_catalog_version()
    session.refresh(order)
    return order
