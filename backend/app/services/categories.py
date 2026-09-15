from sqlmodel import Session, select

from app.models import Category, Product, ProductImage
from app.schemas.catalog import CategoryOut


def descendant_ids(session: Session, slug: str) -> list[int]:
    """One level of children -- the seed taxonomy is two deep.

    ponytail: flat two-level walk, swap for a recursive CTE if the tree ever gets deeper.
    """
    root = session.exec(select(Category).where(Category.slug == slug)).first()
    if not root:
        return []
    children = session.exec(select(Category.id).where(Category.parent_id == root.id)).all()
    return [root.id, *children]


def _hero_images(session: Session) -> dict[int, str]:
    """Best-rated product's primary image per category, for the home department cards.

    ponytail: one ordered pass, first hit per category wins. At ~300 products that beats a
    correlated subquery; past a few thousand make it a ROW_NUMBER() window.
    """
    rows = session.exec(
        select(Product.category_id, ProductImage.url)
        .join(ProductImage, ProductImage.product_id == Product.id)
        .where(ProductImage.position == 0)
        .order_by(Product.rating_avg.desc())
    ).all()

    images: dict[int, str] = {}
    for category_id, url in rows:
        images.setdefault(category_id, url)
    return images


def tree(session: Session) -> list[CategoryOut]:
    rows = session.exec(select(Category)).all()
    images = _hero_images(session)
    by_parent: dict[int | None, list[Category]] = {}
    for row in rows:
        by_parent.setdefault(row.parent_id, []).append(row)

    def build(node: Category) -> CategoryOut:
        children = [build(k) for k in by_parent.get(node.id, [])]
        # A department holds no products of its own, so it borrows its first child's image.
        image = images.get(node.id) or next((c.image for c in children if c.image), None)
        return CategoryOut(
            id=node.id, name=node.name, slug=node.slug, image=image, children=children
        )

    return [build(n) for n in by_parent.get(None, [])]
