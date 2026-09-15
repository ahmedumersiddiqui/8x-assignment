import logging

from sqlalchemy import text
from sqlmodel import Session

log = logging.getLogger(__name__)

_DECREMENT = text(
    "UPDATE variant SET stock = stock - :qty WHERE id = :variant_id AND stock >= :qty"
)
_RESTORE = text("UPDATE variant SET stock = stock + :qty WHERE id = :variant_id")


def reserve(session: Session, variant_id: int, qty: int) -> bool:
    """Atomic conditional decrement: the guard lives in the WHERE clause, not in Python.

    Two concurrent checkouts for the last unit both see stock=1, but only one UPDATE
    matches a row -- SQLite re-evaluates `stock >= :qty` while holding the write lock.
    Returns False when there is not enough stock; the caller rolls back the transaction.
    """
    result = session.execute(_DECREMENT, {"variant_id": variant_id, "qty": qty})
    return result.rowcount == 1


def release(session: Session, variant_id: int, qty: int) -> None:
    session.execute(_RESTORE, {"variant_id": variant_id, "qty": qty})
