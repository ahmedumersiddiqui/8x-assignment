from fastapi import APIRouter

from app.cache import cached
from app.deps import SessionDep
from app.routers.constants import CATEGORY_TREE_TTL_SECONDS
from app.schemas.catalog import CategoryOut
from app.services.categories import tree

router = APIRouter(prefix="/categories", tags=["catalog"])


@router.get("", response_model=list[CategoryOut])
def list_categories(session: SessionDep):
    return cached(
        "categories:tree",
        lambda: [c.model_dump() for c in tree(session)],
        CATEGORY_TREE_TTL_SECONDS,
        model=CategoryOut,
    )
