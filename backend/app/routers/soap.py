"""
SOAP router — handles SOAP chart CRUD and auto-generation.
"""

from fastapi import APIRouter, HTTPException, Header
from datetime import datetime, timezone
import uuid

from app.models.schemas import SOAPChartCreate, SOAPChartUpdate, SOAPChartResponse, MedicalRecordCreate, MedicalRecordResponse
from app.services.soap_generator import generate_soap_chart

router = APIRouter()

# In-memory store
_soap_charts: dict[str, dict] = {}
_medical_records: dict[str, dict] = {}


@router.post("/soap", response_model=SOAPChartResponse)
async def create_soap_chart(
    data: SOAPChartCreate,
    x_user_id: str = Header(default="demo-stylist-001"),
):
    """Create a new SOAP chart for a booking."""
    record = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "is_ai_generated": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    _soap_charts[record["id"]] = record
    return SOAPChartResponse(**record)


@router.get("/soap/{booking_id}", response_model=SOAPChartResponse)
async def get_soap_chart(booking_id: str):
    """Get the SOAP chart for a booking."""
    for chart in _soap_charts.values():
        if chart["booking_id"] == booking_id:
            return SOAPChartResponse(**chart)
    raise HTTPException(status_code=404, detail="SOAP chart not found for this booking")


@router.put("/soap/{chart_id}", response_model=SOAPChartResponse)
async def update_soap_chart(
    chart_id: str,
    data: SOAPChartUpdate,
    x_user_id: str = Header(default="demo-stylist-001"),
):
    """Update a SOAP chart (stylist editing)."""
    record = _soap_charts.get(chart_id)
    if not record:
        raise HTTPException(status_code=404, detail="SOAP chart not found")

    update_data = data.model_dump(exclude_unset=True)
    record.update(update_data)
    record["updated_at"] = datetime.now(timezone.utc)
    _soap_charts[chart_id] = record
    return SOAPChartResponse(**record)


@router.post("/soap/{booking_id}/generate", response_model=SOAPChartResponse)
async def auto_generate_soap(
    booking_id: str,
    x_user_id: str = Header(default="demo-stylist-001"),
):
    """Auto-generate a SOAP chart from booking data."""
    # In production, would fetch real data from Supabase.
    # For MVP, generate with demo data.
    chart = generate_soap_chart(
        booking_id=booking_id,
        stylist_id="stylist-001",
        questionnaire={
            "hair_length": "medium",
            "bleach_count": 2,
            "has_black_dye": False,
            "has_straightening": False,
            "has_perm": False,
            "current_hair_color": "Brown (Level 8)",
            "damage_level": 3,
            "additional_notes": "",
        },
        desired_style="High-tone beige color",
    )
    _soap_charts[chart["id"]] = chart
    return SOAPChartResponse(**chart)


# ──────────────────────────────────────────────
# Medical Records (カルテ)
# ──────────────────────────────────────────────

@router.post("/medical-records", response_model=MedicalRecordResponse)
async def create_medical_record(
    data: MedicalRecordCreate,
    x_user_id: str = Header(default="demo-stylist-001"),
):
    """Save the final medical record (actual recipe, photos, notes) after the session."""
    record = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _medical_records[record["id"]] = record
    return MedicalRecordResponse(**record)


@router.get("/medical-records/booking/{booking_id}", response_model=MedicalRecordResponse)
async def get_medical_record_by_booking(booking_id: str):
    """Get the final medical record for a specific booking."""
    for rec in _medical_records.values():
        if rec["booking_id"] == booking_id:
            return MedicalRecordResponse(**rec)
    raise HTTPException(status_code=404, detail="Medical record not found for this booking")


@router.get("/medical-records/client/{user_id}", response_model=list[MedicalRecordResponse])
async def get_medical_records_by_client(user_id: str):
    """Get all medical records for a specific client (CRM)."""
    records = [rec for rec in _medical_records.values() if rec["user_id"] == user_id]
    return [MedicalRecordResponse(**rec) for rec in records]

