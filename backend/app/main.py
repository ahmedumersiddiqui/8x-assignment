import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from redis.exceptions import RedisError
from sqlalchemy import text

from app.cache import client as redis_client
from app.config import settings
from app.constants import API_PREFIX
from app.db import engine
from app.routers import (
    auth,
    cart,
    categories,
    checkout,
    orders,
    products,
    reviews,
    stores,
    uploads,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
log = logging.getLogger(__name__)

app = FastAPI(title="Amazon Clone API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for module in (auth, categories, products, reviews, cart, checkout, orders, stores, uploads):
    app.include_router(module.router, prefix=API_PREFIX)


@app.get("/health", tags=["ops"])
def health() -> dict:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        database = "ok"
    except Exception:
        log.exception("health: database unreachable")
        database = "down"
    try:
        redis_client.ping()
        cache = "ok"
    except RedisError:
        cache = "down"
    return {
        "status": "ok" if database == "ok" else "degraded",
        "database": database,
        "cache": cache,
    }
