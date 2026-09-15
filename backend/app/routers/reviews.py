from fastapi import APIRouter, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.cache import bump_catalog_version
from app.deps import CurrentUser, OptionalUser, SessionDep
from app.models import Product, Review
from app.routers.constants import REVIEWS_PAGE_SIZE_DEFAULT, REVIEWS_PAGE_SIZE_MAX
from app.schemas.review import ReviewIn, ReviewOut, ReviewPage
from app.services.reviews import summary, to_out, upsert

router = APIRouter(prefix="/products/{slug}/reviews", tags=["reviews"])


def _product(session: Session, slug: str) -> Product:
    product = session.exec(select(Product).where(Product.slug == slug)).first()
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    return product


@router.get("", response_model=ReviewPage)
def list_reviews(
    slug: str,
    session: SessionDep,
    user: OptionalUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(REVIEWS_PAGE_SIZE_DEFAULT, ge=1, le=REVIEWS_PAGE_SIZE_MAX),
    rating: int | None = Query(None, ge=1, le=5),
):
    product = _product(session, slug)
    filters = [Review.product_id == product.id]
    if rating:
        filters.append(Review.rating == rating)

    total = session.exec(select(func.count()).select_from(Review).where(*filters)).one()
    rows = session.exec(
        select(Review)
        .where(*filters)
        .order_by(Review.created_at.desc(), Review.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()

    mine = None
    if user:
        own = session.exec(
            select(Review).where(Review.product_id == product.id, Review.user_id == user.id)
        ).first()
        mine = to_out(own, user.id) if own else None

    return ReviewPage(
        items=[to_out(row, user.id if user else None) for row in rows],
        total=total,
        page=page,
        page_size=page_size,
        summary=summary(session, product.id),
        mine=mine,
    )


@router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def write_review(slug: str, body: ReviewIn, session: SessionDep, user: CurrentUser):
    product = _product(session, slug)
    review = upsert(session, product, user, body)
    bump_catalog_version()
    return to_out(review, user.id)
