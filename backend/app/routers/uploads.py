from fastapi import APIRouter, HTTPException, Request, status

from app.config import settings
from app.deps import CurrentUser, SessionDep
from app.ratelimit import limit
from app.routers.constants import UPLOAD_RATE_LIMIT, UPLOAD_RATE_WINDOW_SECONDS
from app.schemas.store import UploadPolicy, UploadTicketIn, UploadTicketOut
from app.services import r2
from app.services.constants import UPLOAD_URL_TTL_SECONDS
from app.services.listings import owned_store

router = APIRouter(prefix="/uploads", tags=["uploads"])

NOT_CONFIGURED = "Image uploads are not configured on this server"


@router.get("/policy", response_model=UploadPolicy)
def upload_policy():
    """The caps and accepted types, so the sell form renders them from one source of
    truth, plus whether R2 is wired up at all -- so the form can say so up front instead
    of failing on the first file the seller picks."""
    return UploadPolicy(configured=settings.r2_configured)


@router.post("/sign", response_model=UploadTicketOut)
def sign_upload(body: UploadTicketIn, request: Request, user: CurrentUser, session: SessionDep):
    """Hand back a short-lived URL the browser PUTs the file to directly.

    The bytes never pass through this process. What comes back is scoped to the named
    store's own key prefix and signed for exactly this content type and length.
    """
    limit(request, "upload_sign", UPLOAD_RATE_LIMIT, UPLOAD_RATE_WINDOW_SECONDS)
    store = owned_store(session, user, body.store_id)
    if store is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Store not found")
    if not settings.r2_configured:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, NOT_CONFIGURED)

    key = r2.object_key(store.id, body.content_type)
    try:
        upload_url = r2.presign_put(key, body.content_type, body.size_bytes)
    except ValueError as error:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(error)) from error

    return UploadTicketOut(
        upload_url=upload_url,
        key=key,
        public_url=r2.public_url(key),
        expires_in=UPLOAD_URL_TTL_SECONDS,
    )
