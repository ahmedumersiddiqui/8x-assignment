from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy.orm import selectinload
from sqlmodel import func, select

from app.deps import CurrentUser, SessionDep
from app.models import Order
from app.schemas.common import Page
from app.schemas.order import OrderOut

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", response_model=Page[OrderOut])
def list_orders(
    session: SessionDep,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
):
    total = session.exec(select(func.count()).select_from(Order).where(Order.user_id == user.id))
    orders = session.exec(
        select(Order)
        .where(Order.user_id == user.id)
        .options(selectinload(Order.items))
        .order_by(Order.placed_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return Page(items=orders, total=total.one(), page=page, page_size=page_size)


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, session: SessionDep, user: CurrentUser):
    order = session.exec(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    ).first()
    if not order or order.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    return order
