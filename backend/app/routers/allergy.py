"""
Allergy router — handles allergy/risk management checklist.
"""

from fastapi import APIRouter, HTTPException, Header
from datetime import datetime, timezone
import uuid

from app.models.schemas import AllergyChecklistCreate, AllergyChecklistResponse

router = APIRouter()

# In-memory store
_allergy_checklists: dict[str, dict] = {}


@router.post("/allergy-checklist", response_model=AllergyChecklistResponse)
async def create_allergy_checklist(
    data: AllergyChecklistCreate,
    x_user_id: str = Header(default="demo-user-001"),
):
    """Submit an allergy/risk checklist."""
    record = {
        "id": str(uuid.uuid4()),
        "user_id": x_user_id,
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc),
    }
    _allergy_checklists[record["id"]] = record
    return AllergyChecklistResponse(**record)


@router.get("/allergy-checklist/{questionnaire_id}", response_model=AllergyChecklistResponse)
async def get_allergy_checklist(questionnaire_id: str):
    """Get the allergy checklist for a questionnaire."""
    for checklist in _allergy_checklists.values():
        if checklist.get("questionnaire_id") == questionnaire_id:
            return AllergyChecklistResponse(**checklist)
    raise HTTPException(status_code=404, detail="Allergy checklist not found for this questionnaire")


@router.get("/allergy-checklists", response_model=list[AllergyChecklistResponse])
async def list_allergy_checklists(
    x_user_id: str = Header(default="demo-user-001"),
):
    """List all allergy checklists for the current user."""
    results = [
        AllergyChecklistResponse(**c)
        for c in _allergy_checklists.values()
        if c["user_id"] == x_user_id
    ]
    return sorted(results, key=lambda x: x.created_at, reverse=True)
