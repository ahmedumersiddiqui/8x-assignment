"""Deterministic product imagery, generated as data URIs.

A stock-photo service keyed on a random seed returns landscape scenery for "headphones",
which makes a product grid look broken no matter how good the layout is. These are plain
square line drawings instead: one per subcategory, tinted deterministically per product,
with four framings so a gallery has something to page through.

Obviously placeholders, but the right shape, the right rhythm, and no network call --
the catalogue renders identically on a plane.
"""

import base64
import hashlib

CANVAS = 640

# Muted and catalogue-ish on purpose. Random hues go garish and read as a bug.
PALETTE = [
    ("#eaf1f7", "#2f5673"),
    ("#f3efe8", "#6b543a"),
    ("#ecf3ec", "#3c6144"),
    ("#f6eef0", "#7b3f4e"),
    ("#eef0f6", "#454a75"),
    ("#f5f1e6", "#7a6626"),
    ("#eaf2f3", "#2f6366"),
    ("#f2eef5", "#5b4470"),
]

# Drawn on a 100x100 grid, centred on (50, 50). Stroked, never filled.
GLYPHS = {
    "headphones": '<path d="M28 56V46a22 22 0 0 1 44 0v10"/><rect x="20" y="53" width="13" height="19" rx="6"/><rect x="67" y="53" width="13" height="19" rx="6"/>',
    "laptops": '<rect x="27" y="33" width="46" height="30" rx="3"/><path d="M18 71h64l-5-8H23z"/>',
    "smartphones": '<rect x="36" y="25" width="28" height="50" rx="5"/><line x1="45" y1="33" x2="55" y2="33"/><circle cx="50" cy="67" r="2.5"/>',
    "cameras": '<rect x="23" y="38" width="54" height="33" rx="4"/><circle cx="50" cy="54" r="11"/><path d="M38 38l4-7h16l4 7"/>',
    "smart-home": '<rect x="35" y="28" width="30" height="45" rx="12"/><circle cx="50" cy="43" r="7"/><line x1="42" y1="62" x2="58" y2="62"/>',
    "cookware": '<path d="M25 47h50v15a13 13 0 0 1-13 13H38a13 13 0 0 1-13-13z"/><line x1="75" y1="53" x2="87" y2="48"/><path d="M44 40c0-5 6-5 6-10"/>',
    "coffee": '<path d="M31 40h32v18a16 16 0 0 1-16 16A16 16 0 0 1 31 58z"/><path d="M63 45h6a7 7 0 0 1 0 14h-6"/><line x1="26" y1="79" x2="72" y2="79"/>',
    "vacuums": '<path d="M55 25h5a5 5 0 0 1 5 5v4"/><line x1="60" y1="34" x2="49" y2="57"/><rect x="30" y="57" width="32" height="13" rx="4"/><line x1="28" y1="75" x2="64" y2="75"/>',
    "bedding": '<path d="M21 68V45"/><path d="M21 54h58v14"/><rect x="29" y="43" width="19" height="12" rx="4"/><line x1="21" y1="72" x2="79" y2="72"/>',
    "fiction": '<path d="M50 33v38"/><path d="M50 33c-8-6-17-6-25-4v38c8-2 17-2 25 4"/><path d="M50 33c8-6 17-6 25-4v38c-8-2-17-2-25 4"/>',
    "technology-books": '<rect x="30" y="27" width="40" height="47" rx="3"/><path d="M43 43l-6 7 6 7"/><path d="M57 43l6 7-6 7"/>',
    "cookbooks": '<rect x="30" y="27" width="40" height="47" rx="3"/><circle cx="50" cy="44" r="7"/><line x1="50" y1="51" x2="50" y2="63"/>',
    "mens-clothing": '<path d="M38 29l-15 9 6 13 7-4v27h28V47l7 4 6-13-15-9z"/><path d="M38 29h24"/>',
    "womens-clothing": '<path d="M39 29l-13 9 5 11 6-4-5 26h36l-5-26 6 4 5-11-13-9z"/><path d="M43 29l7 9 7-9"/>',
    "shoes": '<path d="M21 61h40l11 7h7a4 4 0 0 1 0 8H21z"/><path d="M32 61l4-9"/><path d="M43 61l4-9"/>',
    "watches": '<circle cx="50" cy="50" r="15"/><path d="M41 36l2-12h14l2 12"/><path d="M41 64l2 12h14l2-12"/><path d="M50 43v8l5 3"/>',
    "fitness": '<line x1="35" y1="50" x2="65" y2="50"/><rect x="24" y="39" width="11" height="22" rx="4"/><rect x="65" y="39" width="11" height="22" rx="4"/>',
    "outdoors": '<path d="M50 27L23 73h54z"/><path d="M50 45v28"/><path d="M39 73l11-16 11 16"/>',
    "cycling": '<path d="M24 60a26 26 0 0 1 52 0"/><line x1="24" y1="60" x2="76" y2="60"/><path d="M41 36c-4 7-6 15-6 24"/><path d="M56 35c4 7 5 16 5 25"/><path d="M31 60l-4 9"/><path d="M69 60l4 9"/>',
    "board-games": '<rect x="26" y="33" width="48" height="42" rx="3"/><line x1="26" y1="54" x2="74" y2="54"/><line x1="50" y1="33" x2="50" y2="75"/><circle cx="38" cy="44" r="4"/><circle cx="62" cy="65" r="4"/>',
    "building-sets": '<rect x="27" y="48" width="25" height="19" rx="3"/><rect x="52" y="48" width="22" height="19" rx="3"/><rect x="39" y="29" width="25" height="19" rx="3"/><circle cx="46" cy="27" r="2.5"/><circle cx="57" cy="27" r="2.5"/>',
    "puzzles": '<path d="M29 33h16a5 5 0 0 1 11 0h15v16a5 5 0 0 0 0 11v16H56a5 5 0 0 0-11 0H29V60a5 5 0 0 1 0-11z"/>',
    "skincare": '<rect x="37" y="39" width="26" height="36" rx="5"/><rect x="44" y="26" width="12" height="13" rx="3"/><line x1="43" y1="52" x2="57" y2="52"/>',
    "hair-care": '<rect x="37" y="41" width="26" height="34" rx="5"/><path d="M45 41v-9h9v9"/><path d="M54 29h9v7"/>',
    "fragrance": '<rect x="37" y="43" width="26" height="32" rx="5"/><rect x="45" y="31" width="10" height="12" rx="2"/><rect x="42" y="24" width="16" height="7" rx="3"/>',
    "coffee-tea": '<path d="M33 33h34l4 42H29z"/><line x1="37" y1="47" x2="63" y2="47"/><path d="M43 33c0-7 14-7 14 0"/>',
    "snacks": '<rect x="24" y="41" width="52" height="21" rx="5"/><line x1="37" y1="41" x2="37" y2="62"/><line x1="50" y1="41" x2="50" y2="62"/><line x1="63" y1="41" x2="63" y2="62"/>',
}

FALLBACK = '<rect x="30" y="30" width="40" height="40" rx="4"/><line x1="30" y1="45" x2="70" y2="45"/>'

# Four framings, so the gallery thumbnails read as different shots of one thing.
FRAMINGS = ((1.0, 0.0), (1.22, 0.0), (0.86, -5.0), (1.06, 6.0))


def product_image(slug: str, category_slug: str, position: int) -> str:
    """A stable data: URI for one product image. Same inputs, same bytes, forever."""
    digest = hashlib.md5(slug.encode(), usedforsecurity=False).digest()
    tint, ink = PALETTE[digest[0] % len(PALETTE)]
    scale, rotate = FRAMINGS[position % len(FRAMINGS)]
    glyph = GLYPHS.get(category_slug, FALLBACK)

    # Every product in a subcategory draws the same glyph, so jitter the framing per slug
    # too. Without this a grid of eleven headphones looks stamped rather than photographed.
    scale += (digest[1] % 9 - 4) / 100
    rotate += digest[2] % 7 - 3

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" '
        f'width="{CANVAS}" height="{CANVAS}">'
        f'<rect width="100" height="100" fill="#fff"/>'
        f'<circle cx="50" cy="50" r="34" fill="{tint}"/>'
        f'<g transform="rotate({rotate} 50 50) translate(50 50) scale({scale}) translate(-50 -50)" '
        f'fill="none" stroke="{ink}" stroke-width="2.4" '
        f'stroke-linecap="round" stroke-linejoin="round">{glyph}</g>'
        f"</svg>"
    )
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()


if __name__ == "__main__":
    # Self-check: deterministic, correctly typed, and short enough for the url column.
    first = product_image("acme-widget", "headphones", 0)
    assert first == product_image("acme-widget", "headphones", 0), "not deterministic"
    assert first.startswith("data:image/svg+xml;base64,")
    assert first != product_image("acme-widget", "headphones", 1), "framings must differ"
    assert first != product_image("other-widget", "headphones", 0), "tint must vary by slug"
    assert product_image("x", "no-such-category", 0), "unknown category must still render"

    longest = max(
        len(product_image("a-fairly-long-product-slug-like-the-seed-makes", key, n))
        for key in GLYPHS
        for n in range(4)
    )
    assert longest < 4000, f"data URI {longest} chars exceeds the url column"
    print(f"ok - {len(GLYPHS)} glyphs, longest data URI {longest} chars")
