from fastapi import APIRouter, HTTPException, Query, status

from app.deps import CurrentUser, DeliveryPostalCode, SessionDep
from app.schemas.order import CheckoutIn, DeliveryOption, OrderOut, TotalsOut
from app.services.cart import get_or_create, lines
from app.services.checkout import EmptyCart, InsufficientStock, place_order
from app.services.pricing import Line, compute_totals, delivery_estimate

router = APIRouter(prefix="/checkout", tags=["checkout"])


@router.get("/preview", response_model=TotalsOut)
def preview(
    session: SessionDep,
    user: CurrentUser,
    cookie_postal_code: DeliveryPostalCode,
    delivery_option: DeliveryOption = Query("standard"),
    postal_code: str | None = Query(None, max_length=20),
):
    """Quote the totals checkout would charge, so the summary is never the client's arithmetic.

    Deliberately shares compute_totals with place_order: one pricing rule, quoted and charged.
    The destination is quoted too: the promise depends on the zone, so a preview that ignored
    where the order is going would disagree with the order it is previewing.
    """
    destination = postal_code or cookie_postal_code
    rows = lines(session, get_or_create(session, user, None))
    if not rows:
        # Nothing to ship, so nothing to charge. compute_totals would bill shipping on a
        # zero subtotal, which POST /checkout never reaches because it rejects an empty cart.
        return TotalsOut(
            item_count=0,
            subtotal_cents=0,
            shipping_cents=0,
            tax_cents=0,
            total_cents=0,
            delivery_estimate=delivery_estimate(delivery_option, destination),
        )
    totals = compute_totals(
        [Line(variant.price_cents, item.qty) for item, variant, _, _ in rows],
        delivery_option,
        user.is_prime,
    )
    return TotalsOut(
        item_count=sum(item.qty for item, _, _, _ in rows),
        subtotal_cents=totals.subtotal_cents,
        shipping_cents=totals.shipping_cents,
        tax_cents=totals.tax_cents,
        total_cents=totals.total_cents,
        delivery_estimate=delivery_estimate(delivery_option, destination),
    )


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def checkout(body: CheckoutIn, session: SessionDep, user: CurrentUser):
    cart = get_or_create(session, user, None)
    try:
        return place_order(session, user, cart, body)
    except EmptyCart:
        raise HTTPException(status.HTTP_409_CONFLICT, "Your cart is empty") from None
    except InsufficientStock as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from None
