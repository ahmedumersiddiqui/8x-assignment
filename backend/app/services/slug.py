"""URL slugs, shared by product listings and storefronts."""

import unicodedata

from sqlmodel import Session, select

MAX_SLUG_LENGTH = 180


def slugify(value: str) -> str:
    """ASCII-only, because this ends up in a URL. str.isalnum() is true for accented
    letters, so fold them first rather than shipping /p/café-kettle."""
    folded = unicodedata.normalize("NFKD", value.lower())
    out: list[str] = []
    for char in folded:
        if char.isascii() and char.isalnum():
            out.append(char)
        elif unicodedata.combining(char):
            continue
        elif out and out[-1] != "-":
            out.append("-")
    return "".join(out).strip("-")[:MAX_SLUG_LENGTH] or "item"


def unique_slug(session: Session, column, value: str) -> str:
    """A slug nothing else in that column is using yet.

    Two sellers may legitimately name their shop the same thing, and one seller may list
    the same title twice, so the suffix is the normal path rather than an edge case.
    """
    base = slugify(value)
    slug, suffix = base, 2
    while session.exec(select(column).where(column == slug)).first():
        slug = f"{base}-{suffix}"
        suffix += 1
    return slug


if __name__ == "__main__":
    assert slugify("Acme Widget Pro 3000") == "acme-widget-pro-3000"
    assert slugify("  Ünïcode -- and   spaces!! ") == "unicode-and-spaces"
    assert slugify("Fern & Oak") == "fern-oak"
    assert slugify("!!!") == "item", "a name with no usable characters still needs a slug"
    assert len(slugify("x" * 500)) == MAX_SLUG_LENGTH
    print("ok - slugify")
