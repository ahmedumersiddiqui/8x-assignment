"""Cloudflare R2 object storage, S3-compatible.

Image bytes never touch this API. The browser asks for a signed ticket, PUTs the file
straight to R2, and sends back only the object key -- so a 5 MB upload costs the API one
signature instead of one request body.

The size cap is bound *into* the signature: boto3 signs content-length, so R2 rejects a
body whose length differs from the one we signed for. A client cannot ask for a 1 MB
ticket and then push 50 MB through it.
"""

import logging
from functools import cache
from uuid import uuid4

import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError

from app.config import settings
from app.services.constants import (
    ALLOWED_IMAGE_TYPES,
    MAX_UPLOAD_BYTES,
    UPLOAD_URL_TTL_SECONDS,
)

log = logging.getLogger(__name__)

STORE_PREFIX = "stores"


class UploadNotConfigured(RuntimeError):
    """No R2 credentials in the environment. Callers turn this into a 503."""


@cache
def _client():
    if not settings.r2_configured:
        raise UploadNotConfigured
    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.r2_account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.r2_access_key_id,
        aws_secret_access_key=settings.r2_secret_access_key,
        # R2 has no regions, but SigV4 requires one in the credential scope.
        region_name="auto",
        config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
    )


def object_key(store_id: int, content_type: str) -> str:
    """A key that belongs to one store. The prefix is load-bearing: it is how the listing
    endpoint proves an image belongs to the caller's store, and the UUID means a
    client-supplied filename never reaches storage."""
    return f"{STORE_PREFIX}/{store_id}/{uuid4().hex}.{ALLOWED_IMAGE_TYPES[content_type]}"


def owns_key(key: str, store_id: int) -> bool:
    return key.startswith(f"{STORE_PREFIX}/{store_id}/")


def presign_put(key: str, content_type: str, size_bytes: int) -> str:
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise ValueError(f"unsupported content type: {content_type}")
    if not 0 < size_bytes <= MAX_UPLOAD_BYTES:
        raise ValueError(f"size {size_bytes} outside 1..{MAX_UPLOAD_BYTES}")
    return _client().generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.r2_bucket,
            "Key": key,
            "ContentType": content_type,
            # Signed, not advisory -- see the module docstring.
            "ContentLength": size_bytes,
        },
        ExpiresIn=UPLOAD_URL_TTL_SECONDS,
        HttpMethod="PUT",
    )


def public_url(key: str) -> str:
    return f"{settings.r2_public_base_url.rstrip('/')}/{key}"


def key_from_url(url: str) -> str | None:
    """The object key a stored image URL points at, or None if it is not an R2 object.

    Seed images are inline data: URIs, so anything that does not carry the store prefix
    is simply not ours to delete.
    """
    _, marker, tail = url.partition(f"/{STORE_PREFIX}/")
    return f"{STORE_PREFIX}/{tail}" if marker else None


def object_size(key: str) -> int | None:
    """Bytes actually in the bucket, or None if the key was never uploaded."""
    try:
        return _client().head_object(Bucket=settings.r2_bucket, Key=key)["ContentLength"]
    except ClientError as error:
        if error.response.get("ResponseMetadata", {}).get("HTTPStatusCode") == 404:
            return None
        raise


def delete_objects(keys: list[str]) -> None:
    """Best effort. A listing that failed to delete its images is a stray object, not a
    broken response, so this logs rather than raises."""
    if not keys:
        return
    try:
        _client().delete_objects(
            Bucket=settings.r2_bucket,
            Delete={"Objects": [{"Key": key} for key in keys]},
        )
    except (BotoCoreError, ClientError, UploadNotConfigured):
        log.warning("r2: could not delete %s orphaned object(s)", len(keys), exc_info=True)


if __name__ == "__main__":
    # Self-check: runs without credentials or network. Verifies the two things that are
    # easy to get silently wrong -- that the cap is enforced before signing, and that
    # content-length really is in the signature rather than just in the request we hope
    # the browser sends.
    from urllib.parse import parse_qs, urlparse

    settings.r2_account_id = "acct"
    settings.r2_access_key_id = "AKIAIOSFODNN7EXAMPLE"
    settings.r2_secret_access_key = "wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY"
    settings.r2_bucket = "media"
    settings.r2_public_base_url = "https://media.example.com/"
    _client.cache_clear()

    key = object_key(7, "image/jpeg")
    assert key.startswith("stores/7/"), key
    assert key.endswith(".jpg"), key
    assert owns_key(key, 7) and not owns_key(key, 8), "prefix must scope to one store"
    assert not owns_key("stores/7x/f.jpg", 7), "prefix match must not be a bare startswith"
    assert public_url(key) == f"https://media.example.com/{key}", public_url(key)

    url = presign_put(key, "image/jpeg", 1234)
    query = parse_qs(urlparse(url).query)
    signed = query["X-Amz-SignedHeaders"][0]
    assert "content-length" in signed, f"cap is not signed, only advisory: {signed}"
    assert "content-type" in signed, f"content type is not signed: {signed}"
    assert query["X-Amz-Expires"][0] == str(UPLOAD_URL_TTL_SECONDS)
    assert urlparse(url).path == f"/media/{key}", urlparse(url).path

    # A different length is a different signature, which is what makes the cap real.
    assert query["X-Amz-Signature"] != parse_qs(
        urlparse(presign_put(key, "image/jpeg", 1235)).query
    )["X-Amz-Signature"], "signature must depend on content-length"

    for bad_size in (0, -1, MAX_UPLOAD_BYTES + 1):
        try:
            presign_put(key, "image/jpeg", bad_size)
        except ValueError:
            pass
        else:
            raise AssertionError(f"signed an out-of-range upload: {bad_size}")
    try:
        presign_put(key, "image/svg+xml", 10)
    except ValueError:
        pass
    else:
        raise AssertionError("signed a disallowed content type")

    assert key_from_url(public_url(key)) == key, key_from_url(public_url(key))
    assert key_from_url("data:image/svg+xml;base64,AAAA") is None, "seed images are not R2 keys"

    print(f"ok - cap {MAX_UPLOAD_BYTES // 1024 // 1024} MB bound into signed headers: {signed}")
