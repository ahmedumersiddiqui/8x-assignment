from sqlmodel import Session, func, select

from app.models import Order, OrderItem, Product, Review, User, Variant
from app.schemas.review import RatingSummary, ReviewIn, ReviewOut
from app.services.constants import RATING_STARS


def has_purchased(session: Session, user_id: int, product_id: int) -> bool:
    row = session.exec(
        select(OrderItem.id)
        .join(Order, Order.id == OrderItem.order_id)
        .join(Variant, Variant.id == OrderItem.variant_id)
        .where(Order.user_id == user_id, Variant.product_id == product_id)
        .limit(1)
    ).first()
    return row is not None


def upsert(session: Session, product: Product, user: User, body: ReviewIn) -> Review:
    review = session.exec(
        select(Review).where(Review.product_id == product.id, Review.user_id == user.id)
    ).first()

    if review is None:
        review = Review(
            product_id=product.id,
            user_id=user.id,
            author_name=user.name,
            verified_purchase=has_purchased(session, user.id, product.id),
        )

    review.rating = body.rating
    review.title = body.title
    review.body = body.body
    session.add(review)
    session.flush()
    recompute_rating(session, product)
    session.commit()
    session.refresh(review)
    return review


def recompute_rating(session: Session, product: Product) -> None:
    average, count = session.exec(
        select(func.avg(Review.rating), func.count()).where(Review.product_id == product.id)
    ).one()
    product.rating_avg = round(average or 0.0, 1)
    product.rating_count = count
    session.add(product)


def summary(session: Session, product_id: int) -> RatingSummary:
    rows = session.exec(
        select(Review.rating, func.count())
        .where(Review.product_id == product_id)
        .group_by(Review.rating)
    ).all()
    counts = {str(star): 0 for star in RATING_STARS}
    for rating, count in rows:
        counts[str(rating)] = count
    total = sum(counts.values())
    weighted = sum(int(star) * count for star, count in counts.items())
    return RatingSummary(
        average=round(weighted / total, 1) if total else 0.0,
        count=total,
        histogram=counts,
    )


def to_out(review: Review, current_user_id: int | None) -> ReviewOut:
    return ReviewOut(
        id=review.id,
        rating=review.rating,
        title=review.title,
        body=review.body,
        author_name=review.author_name,
        verified_purchase=review.verified_purchase,
        created_at=review.created_at,
        is_mine=review.user_id == current_user_id,
    )
