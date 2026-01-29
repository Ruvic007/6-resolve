from fastapi import APIRouter
from src.services.subventions_data import SUBVENTIONS_LIST

router = APIRouter(prefix="/subventions", tags=["Subventions"])

@router.get("/")
async def get_subventions():
    """Retourne la liste complète des subventions pour le Dashboard."""
    return {
        "status": "success",
        "count": len(SUBVENTIONS_LIST),
        "data": SUBVENTIONS_LIST
    }