from datetime import date

import pytest

from app.services.constants import SHIPPING_CENTS, TAX_BPS, UNKNOWN_ZONE_EXTRA_DAYS
from app.services.pricing import Line, compute_totals, delivery_estimate, zone_extra_days


def test_totals_are_integers_and_add_up():
    totals = compute_totals([Line(999, 2), Line(500, 1)], "standard", is_prime=False)
    assert totals.subtotal_cents == 2498
    assert totals.shipping_cents == SHIPPING_CENTS["standard"]
    assert totals.tax_cents == 2498 * TAX_BPS // 10_000
    assert totals.total_cents == sum(
        (totals.subtotal_cents, totals.shipping_cents, totals.tax_cents)
    )
    assert all(isinstance(v, int) for v in vars(totals).values())


def test_free_standard_shipping_over_threshold_and_for_prime():
    assert compute_totals([Line(10_000, 1)], "standard", False).shipping_cents == 0
    assert compute_totals([Line(100, 1)], "standard", True).shipping_cents == 0
    # Prime does not make express free.
    assert (
        compute_totals([Line(100, 1)], "express", True).shipping_cents
        == (SHIPPING_CENTS["express"])
    )


def test_tax_rounds_down_never_producing_a_fraction_of_a_cent():
    assert compute_totals([Line(1, 1)], "express", False).tax_cents == 0


@pytest.mark.parametrize(
    ("option", "expected"),
    [("express", "Wed, Sep 16"), ("standard", "Mon, Sep 21")],
)
def test_delivery_estimate_skips_weekends(option, expected):
    assert delivery_estimate(option, today=date(2026, 9, 14)) == expected


@pytest.mark.parametrize(
    ("postal_code", "expected"),
    [
        ("10001", "Mon, Sep 21"),
        ("98101", "Thu, Sep 24"),
        ("60601", "Wed, Sep 23"),
        (None, "Mon, Sep 21"),
        ("", "Mon, Sep 21"),
        ("SW1A 1AA", "Mon, Sep 21"),
    ],
)
def test_delivery_zone_moves_the_promise(postal_code, expected):
    assert delivery_estimate("standard", postal_code, date(2026, 9, 14)) == expected


def test_express_still_beats_standard_in_the_same_zone():
    express = delivery_estimate("express", "98101", date(2026, 9, 14))
    standard = delivery_estimate("standard", "98101", date(2026, 9, 14))
    assert express != standard
    assert express == "Mon, Sep 21"


def test_an_unknown_zone_falls_back_rather_than_raising():
    assert zone_extra_days("ZZZZZ") == UNKNOWN_ZONE_EXTRA_DAYS
    assert zone_extra_days(None) == UNKNOWN_ZONE_EXTRA_DAYS
