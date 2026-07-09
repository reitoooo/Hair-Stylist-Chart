"""
Chat router — handles chat messages for booking communication.
"""

from fastapi import APIRouter, HTTPException, Header
from datetime import datetime, timezone
import uuid

from app.models.schemas import ChatMessageCreate, ChatMessageResponse

router = APIRouter()

# In-memory store
_messages: dict[str, list[dict]] = {}  # booking_id -> messages


@router.post("/chat/messages", response_model=ChatMessageResponse)
async def send_message(
    data: ChatMessageCreate,
    x_user_id: str = Header(default="demo-user-001"),
):
    """Send a chat message in a booking conversation."""
    record = {
        "id": str(uuid.uuid4()),
        "booking_id": data.booking_id,
        "sender_id": x_user_id,
        "sender_name": "User",  # Would be resolved from profiles
        "content": data.content,
        "created_at": datetime.now(timezone.utc),
    }

    if data.booking_id not in _messages:
        _messages[data.booking_id] = []
    _messages[data.booking_id].append(record)

    return ChatMessageResponse(**record)


@router.get("/chat/messages/{booking_id}", response_model=list[ChatMessageResponse])
async def get_messages(booking_id: str):
    """Get all chat messages for a booking."""
    messages = _messages.get(booking_id, [])
    return [ChatMessageResponse(**m) for m in messages]
