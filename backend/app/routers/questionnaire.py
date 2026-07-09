"""
Questionnaire router — handles hair history data submission and retrieval.
"""

from fastapi import APIRouter, HTTPException, Header
from datetime import datetime, timezone
import uuid

from app.models.schemas import (
    QuestionnaireCreate,
    QuestionnaireResponse,
    DesiredStyleCreate,
    DesiredStyleResponse,
)

router = APIRouter()

# In-memory store (will be replaced with Supabase)
_questionnaires: dict[str, dict] = {}
_desired_styles: dict[str, dict] = {}


@router.post("/questionnaire", response_model=QuestionnaireResponse)
async def create_questionnaire(
    data: QuestionnaireCreate,
    x_user_id: str = Header(default="demo-user-001"),
):
    """Save a new questionnaire response."""
    record = {
        "id": str(uuid.uuid4()),
        "user_id": x_user_id,
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc),
    }
    _questionnaires[record["id"]] = record
    return QuestionnaireResponse(**record)


@router.get("/questionnaire/{questionnaire_id}", response_model=QuestionnaireResponse)
async def get_questionnaire(questionnaire_id: str):
    """Retrieve a questionnaire by ID."""
    record = _questionnaires.get(questionnaire_id)
    if not record:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    return QuestionnaireResponse(**record)


@router.get("/questionnaires", response_model=list[QuestionnaireResponse])
async def list_questionnaires(
    x_user_id: str = Header(default="demo-user-001"),
):
    """List all questionnaires for the current user."""
    results = [
        QuestionnaireResponse(**q)
        for q in _questionnaires.values()
        if q["user_id"] == x_user_id
    ]
    return sorted(results, key=lambda x: x.created_at, reverse=True)


@router.post("/desired-style", response_model=DesiredStyleResponse)
async def create_desired_style(
    data: DesiredStyleCreate,
    x_user_id: str = Header(default="demo-user-001"),
):
    """Save a desired style image reference."""
    record = {
        "id": str(uuid.uuid4()),
        "user_id": x_user_id,
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc),
    }
    _desired_styles[record["id"]] = record
    return DesiredStyleResponse(**record)


@router.get("/desired-style/{style_id}", response_model=DesiredStyleResponse)
async def get_desired_style(style_id: str):
    """Retrieve a desired style by ID."""
    record = _desired_styles.get(style_id)
    if not record:
        raise HTTPException(status_code=404, detail="Desired style not found")
    return DesiredStyleResponse(**record)
