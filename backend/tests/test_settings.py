"""CORS_ORIGINS arrives as an env string. Getting it wrong takes the whole API down at import."""

import pytest

from app.config import Settings


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ('["https://a.vercel.app"]', ["https://a.vercel.app"]),
        ("https://a.vercel.app", ["https://a.vercel.app"]),
        ("https://a.vercel.app,https://b.vercel.app", ["https://a.vercel.app", "https://b.vercel.app"]),
        (" https://a.vercel.app , https://b.vercel.app ", ["https://a.vercel.app", "https://b.vercel.app"]),
        ("", []),
    ],
)
def test_cors_origins_accepts_json_or_comma_separated(monkeypatch, raw, expected):
    monkeypatch.setenv("CORS_ORIGINS", raw)
    assert Settings(_env_file=None).cors_origins == expected


def test_cors_origins_defaults_to_localhost(monkeypatch):
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    assert Settings(_env_file=None).cors_origins == ["http://localhost:3000"]
