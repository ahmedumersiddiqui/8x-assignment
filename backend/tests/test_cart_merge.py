from sqlmodel import Session, select

from app.models import Cart, CartItem, Category, Product, User, Variant
from app.services.cart import merge_guest_cart
from app.services.constants import MAX_QTY_PER_LINE


def _catalog(session: Session) -> list[int]:
    session.add(Category(id=1, name="Electronics", slug="electronics"))
    session.add(Product(id=1, slug="p", title="Widget", brand="Acme", category_id=1))
    variants = [Variant(product_id=1, sku=f"SKU-{n}", price_cents=1000, stock=99) for n in range(3)]
    session.add_all(variants)
    session.commit()
    return [v.id for v in variants]


def _user(session: Session) -> User:
    user = User(email="a@b.co", name="A", password_hash="x")
    session.add(user)
    session.commit()
    return user


def _qtys(session: Session, cart_id: int) -> dict[int, int]:
    items = session.exec(select(CartItem).where(CartItem.cart_id == cart_id)).all()
    return {i.variant_id: i.qty for i in items}


def test_merge_sums_overlaps_adds_new_and_drops_the_guest_cart(session):
    a, b, c = _catalog(session)
    user = _user(session)
    guest = Cart(token="guest-token")
    mine = Cart(user_id=user.id)
    session.add_all([guest, mine])
    session.commit()
    session.add_all(
        [
            CartItem(cart_id=guest.id, variant_id=a, qty=2),
            CartItem(cart_id=guest.id, variant_id=c, qty=1),
            CartItem(cart_id=mine.id, variant_id=a, qty=3),
            CartItem(cart_id=mine.id, variant_id=b, qty=1),
        ]
    )
    session.commit()

    merge_guest_cart(session, "guest-token", user)

    assert _qtys(session, mine.id) == {a: 5, b: 1, c: 1}
    assert session.exec(select(Cart).where(Cart.token == "guest-token")).first() is None


def test_merge_caps_the_line_quantity(session):
    a, *_ = _catalog(session)
    user = _user(session)
    guest, mine = Cart(token="t"), Cart(user_id=user.id)
    session.add_all([guest, mine])
    session.commit()
    session.add_all(
        [
            CartItem(cart_id=guest.id, variant_id=a, qty=MAX_QTY_PER_LINE),
            CartItem(cart_id=mine.id, variant_id=a, qty=MAX_QTY_PER_LINE),
        ]
    )
    session.commit()

    merge_guest_cart(session, "t", user)

    assert _qtys(session, mine.id) == {a: MAX_QTY_PER_LINE}


def test_merge_with_no_guest_cart_is_a_no_op(session):
    _catalog(session)
    user = _user(session)
    merge_guest_cart(session, "nothing-here", user)
    assert session.exec(select(Cart)).all() == []
