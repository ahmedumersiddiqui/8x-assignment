"""Every amount here is integer minor units. No float ever touches a price."""

from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta

from app.services.constants import (
    DELIVERY_BUSINESS_DAYS,
    DELIVERY_ZONE_EXTRA_DAYS,
    FREE_SHIPPING_THRESHOLD_CENTS,
    SHIPPING_CENTS,
    TAX_BPS,
    UNKNOWN_ZONE_EXTRA_DAYS,
)


@dataclass(frozen=True)
class Line:
    unit_price_cents: int
    qty: int


@dataclass(frozen=True)
class Totals:
    subtotal_cents: int
    shipping_cents: int
    tax_cents: int
    total_cents: int


def compute_totals(lines: list[Line], delivery_option: str, is_prime: bool) -> Totals:
    subtotal = sum(line.unit_price_cents * line.qty for line in lines)
    free = is_prime or subtotal >= FREE_SHIPPING_THRESHOLD_CENTS
    shipping = 0 if free and delivery_option == "standard" else SHIPPING_CENTS[delivery_option]
    tax = subtotal * TAX_BPS // 10_000
    return Totals(subtotal, shipping, tax, subtotal + shipping + tax)


def zone_extra_days(postal_code: str | None) -> int:
    """Transit days on top of the shipping option, from the delivery zone."""
    if not postal_code or not postal_code[0].isdigit():
        return UNKNOWN_ZONE_EXTRA_DAYS
    return DELIVERY_ZONE_EXTRA_DAYS.get(postal_code[0], UNKNOWN_ZONE_EXTRA_DAYS)


def delivery_estimate(
    delivery_option: str,
    postal_code: str | None = None,
    today: date | None = None,
) -> str:
    """today + option days + zone days, weekends skipped. No carrier calendar, no holidays."""
    day = today or datetime.now(UTC).date()
    remaining = DELIVERY_BUSINESS_DAYS[delivery_option] + zone_extra_days(postal_code)
    while remaining:
        day += timedelta(days=1)
        if day.weekday() < 5:
            remaining -= 1
    return f"{day:%a}, {day:%b} {day.day}"
