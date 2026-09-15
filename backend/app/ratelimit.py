import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

_hits: dict[str, deque[float]] = defaultdict(deque)


def limit(request: Request, bucket: str, max_hits: int, window_seconds: int) -> None:
    """ponytail: per-process sliding window. Move to a Redis INCR if this ever runs >1 worker."""
    key = f"{bucket}:{request.client.host if request.client else 'unknown'}"
    now = time.monotonic()
    hits = _hits[key]
    while hits and now - hits[0] > window_seconds:
        hits.popleft()
    if len(hits) >= max_hits:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many attempts, slow down")
    hits.append(now)
