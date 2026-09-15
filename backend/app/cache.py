import hashlib
import json
import logging
from collections.abc import Callable
from functools import cache
from typing import Any

from pydantic import BaseModel
from redis import Redis
from redis.exceptions import RedisError

from app.config import settings
from app.constants import CACHE_SOCKET_TIMEOUT_SECONDS, CACHE_VERSION_KEY

log = logging.getLogger(__name__)
client = Redis.from_url(
    settings.redis_url,
    decode_responses=True,
    socket_timeout=CACHE_SOCKET_TIMEOUT_SECONDS,
)


def catalog_version() -> str:
    """Cache keys embed this, so a bump invalidates every catalog key without a KEYS scan."""
    try:
        return client.get(CACHE_VERSION_KEY) or "0"
    except RedisError:
        return "0"


def bump_catalog_version() -> None:
    try:
        client.incr(CACHE_VERSION_KEY)
    except RedisError:
        log.warning("cache: version bump failed, serving stale until TTL")


@cache
def schema_tag(model: type[BaseModel]) -> str:
    """Fingerprint of a response shape.

    Cached payloads outlive the code that wrote them. Without this, adding a field to a
    response model serves shape-stale JSON until the TTL expires, and FastAPI rejects it
    as a 500. Keying on the shape means an edited model simply starts from a cold cache.
    """
    schema = json.dumps(model.model_json_schema(), sort_keys=True, default=str)
    return hashlib.sha1(schema.encode(), usedforsecurity=False).hexdigest()[:8]


def cached(
    key: str,
    build: Callable[[], Any],
    ttl: int | None = None,
    *,
    model: type[BaseModel] | None = None,
) -> Any:
    """Read-through cache. Fails open: Redis being down degrades speed, never correctness."""
    prefix = f"{schema_tag(model)}:" if model else ""
    full = f"v{catalog_version()}:{prefix}{key}"
    try:
        hit = client.get(full)
    except RedisError:
        return build()
    if hit is not None:
        return json.loads(hit)
    value = build()
    try:
        client.setex(full, ttl or settings.cache_ttl, json.dumps(value, default=str))
    except RedisError:
        pass
    return value
