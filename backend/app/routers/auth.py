from fastapi import APIRouter, HTTPException, Request, Response, status
from sqlmodel import select

from app.config import settings
from app.constants import AUTH_COOKIE, CART_COOKIE
from app.deps import CurrentUser, SessionDep
from app.models import User
from app.ratelimit import limit
from app.routers.constants import AUTH_RATE_LIMIT, AUTH_RATE_WINDOW_SECONDS
from app.schemas.auth import LoginIn, RegisterIn, UserOut
from app.security import create_token, hash_password, set_cookie, verify_password
from app.services.cart import merge_guest_cart

router = APIRouter(prefix="/auth", tags=["auth"])


def _sign_in(response: Response, request: Request, session, user: User) -> UserOut:
    token = request.cookies.get(CART_COOKIE)
    if token:
        merge_guest_cart(session, token, user)
        response.delete_cookie(CART_COOKIE, path="/")
    set_cookie(response, AUTH_COOKIE, create_token(user.id), settings.jwt_ttl_hours * 3600)
    return UserOut.model_validate(user, from_attributes=True)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(body: RegisterIn, request: Request, response: Response, session: SessionDep):
    limit(request, "register", AUTH_RATE_LIMIT, AUTH_RATE_WINDOW_SECONDS)
    email = body.email.lower()
    if session.exec(select(User).where(User.email == email)).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "That email already has an account")
    user = User(email=email, name=body.name, password_hash=hash_password(body.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return _sign_in(response, request, session, user)


@router.post("/login", response_model=UserOut)
def login(body: LoginIn, request: Request, response: Response, session: SessionDep):
    limit(request, "login", AUTH_RATE_LIMIT, AUTH_RATE_WINDOW_SECONDS)
    user = session.exec(select(User).where(User.email == body.email.lower())).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Email or password is incorrect")
    return _sign_in(response, request, session, user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response):
    response.delete_cookie(AUTH_COOKIE, path="/")


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser):
    return UserOut.model_validate(user, from_attributes=True)
