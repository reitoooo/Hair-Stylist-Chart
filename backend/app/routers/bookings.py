"""
Bookings router — handles reservation requests and status updates.
"""

from fastapi import APIRouter, HTTPException, Header, Query
from datetime import datetime, timezone
import uuid

from app.models.schemas import (
    BookingCreate,
    BookingResponse,
    BookingStatusUpdate,
    BookingStatus,
)

router = APIRouter()

# In-memory store
_bookings: dict[str, dict] = {}


@router.post("/bookings", response_model=BookingResponse)
async def create_booking(
    data: BookingCreate,
    x_user_id: str = Header(default="demo-user-001"),
):
    """Create a new booking request. Triggers AI recipe generation."""
    record = {
        "id": str(uuid.uuid4()),
        "user_id": x_user_id,
        **data.model_dump(),
        "preferred_datetime": data.preferred_datetime.isoformat(),
        "status": BookingStatus.PENDING,
        "ai_recipe_id": None,
        "created_at": datetime.now(timezone.utc),
        "questionnaire": None,
        "desired_style": None,
        "stylist": None,
    }
    _bookings[record["id"]] = record

    # TODO: Trigger async AI recipe generation here
    # recipe = await recipe_generator.generate(data.questionnaire_id, data.desired_style_id, data.stylist_id)
    # record["ai_recipe_id"] = recipe.id

    return BookingResponse(**{
        **record,
        "preferred_datetime": data.preferred_datetime,
    })


@router.get("/bookings", response_model=list[BookingResponse])
async def list_bookings(
    role: str = Query("user", description="Role: user or stylist"),
    status: BookingStatus | None = Query(None, description="Filter by status"),
    x_user_id: str = Header(default="demo-user-001"),
):
    """List bookings for the current user or stylist."""
    results = list(_bookings.values())

    if role == "stylist":
        results = [b for b in results if b["stylist_id"] == x_user_id]
    else:
        results = [b for b in results if b["user_id"] == x_user_id]

    if status:
        results = [b for b in results if b["status"] == status]

    return [BookingResponse(**b) for b in sorted(results, key=lambda x: x["created_at"], reverse=True)]


@router.get("/bookings/{booking_id}", response_model=BookingResponse)
async def get_booking(booking_id: str):
    """Get booking details by ID."""
    record = _bookings.get(booking_id)
    if not record:
        raise HTTPException(status_code=404, detail="Booking not found")
    return BookingResponse(**record)


@router.patch("/bookings/{booking_id}/status", response_model=BookingResponse)
async def update_booking_status(
    booking_id: str,
    data: BookingStatusUpdate,
    x_user_id: str = Header(default="demo-stylist-001"),
):
    """Update booking status (approve/reject). Stylist only."""
    record = _bookings.get(booking_id)
    if not record:
        raise HTTPException(status_code=404, detail="Booking not found")

    record["status"] = data.status
    _bookings[booking_id] = record
    return BookingResponse(**record)
