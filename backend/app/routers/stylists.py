"""
Stylists router — handles stylist profile CRUD and search.
"""

from fastapi import APIRouter, HTTPException, Header, Query
from datetime import datetime, timezone
import uuid

from app.models.schemas import (
    StylistProfileCreate,
    StylistProfileUpdate,
    StylistProfileResponse,
)

router = APIRouter()

# Demo stylist data (in-memory, replaced by Supabase later)
_stylist_profiles: dict[str, dict] = {}


def _seed_demo_stylists():
    """Seed demo stylist data for MVP."""
    demo_stylists = [
        {
            "id": "stylist-001",
            "profile_id": "profile-stylist-001",
            "display_name": "Yuki Tanaka",
            "avatar_url": None,
            "bio": "Specializing in high-tone colors and balayage. 8 years of experience with European-trained techniques. I love creating unique color expressions for each client.",
            "specialties": ["highlight", "balayage", "double_color", "bleach", "design_color"],
            "product_brands": ["WELLA", "THROW", "ADMIIO", "FIOLE"],
            "years_experience": 8,
            "location": "Shibuya, Tokyo",
            "portfolio_urls": [],
            "rating": 4.8,
            "review_count": 156,
            "created_at": datetime.now(timezone.utc),
        },
        {
            "id": "stylist-002",
            "profile_id": "profile-stylist-002",
            "display_name": "Rina Suzuki",
            "avatar_url": None,
            "bio": "Hair color specialist focused on damage-care coloring. I use the latest low-damage bleaching techniques to achieve beautiful high-tone colors while maintaining hair health.",
            "specialties": ["color", "bleach", "treatment", "care_bleach", "inner_color"],
            "product_brands": ["MILBON", "TOKIO", "OLAPLEX", "THROW"],
            "years_experience": 5,
            "location": "Omotesando, Tokyo",
            "portfolio_urls": [],
            "rating": 4.9,
            "review_count": 98,
            "created_at": datetime.now(timezone.utc),
        },
        {
            "id": "stylist-003",
            "profile_id": "profile-stylist-003",
            "display_name": "Kenta Yamamoto",
            "avatar_url": None,
            "bio": "Passionate about creating trendy styles inspired by K-pop and anime culture. Expert in vivid colors and creative bleach designs.",
            "specialties": ["vivid_color", "bleach", "design_color", "men_color", "unicorn_color"],
            "product_brands": ["MANIC PANIC", "COLORR", "WELLA", "N."],
            "years_experience": 6,
            "location": "Harajuku, Tokyo",
            "portfolio_urls": [],
            "rating": 4.7,
            "review_count": 203,
            "created_at": datetime.now(timezone.utc),
        },
        {
            "id": "stylist-004",
            "profile_id": "profile-stylist-004",
            "display_name": "Mio Nakamura",
            "avatar_url": None,
            "bio": "Natural and transparent color specialist. I'm skilled at creating soft, gradient color that enhances your natural beauty. Particularly experienced with fine/thin hair.",
            "specialties": ["gradation", "transparent_color", "natural_highlight", "color", "cut"],
            "product_brands": ["ILLUMINA", "ADMIIO", "ARIMINO", "MILBON"],
            "years_experience": 10,
            "location": "Ginza, Tokyo",
            "portfolio_urls": [],
            "rating": 4.9,
            "review_count": 312,
            "created_at": datetime.now(timezone.utc),
        },
        {
            "id": "stylist-005",
            "profile_id": "profile-stylist-005",
            "display_name": "Haruto Saito",
            "avatar_url": None,
            "bio": "From dark hair transformations to extreme makeovers — I handle complex color corrections and damaged hair recovery. Former WELLA educator.",
            "specialties": ["color_correction", "bleach", "damage_repair", "double_color", "dark_to_light"],
            "product_brands": ["WELLA", "OLAPLEX", "TOKIO", "FIOLE", "MUCOTA"],
            "years_experience": 12,
            "location": "Shinjuku, Tokyo",
            "portfolio_urls": [],
            "rating": 4.6,
            "review_count": 87,
            "created_at": datetime.now(timezone.utc),
        },
    ]
    for s in demo_stylists:
        _stylist_profiles[s["id"]] = s


# Seed on module load
_seed_demo_stylists()


@router.get("/stylists", response_model=list[StylistProfileResponse])
async def list_stylists(
    specialty: str | None = Query(None, description="Filter by specialty"),
    brand: str | None = Query(None, description="Filter by product brand"),
    location: str | None = Query(None, description="Filter by location"),
    sort_by: str = Query("rating", description="Sort by: rating, experience, reviews"),
):
    """List/search stylists with optional filters."""
    results = list(_stylist_profiles.values())

    if specialty:
        results = [s for s in results if specialty.lower() in [sp.lower() for sp in s["specialties"]]]
    if brand:
        results = [s for s in results if brand.upper() in [b.upper() for b in s["product_brands"]]]
    if location:
        results = [s for s in results if location.lower() in s["location"].lower()]

    # Sort
    if sort_by == "experience":
        results.sort(key=lambda x: x["years_experience"], reverse=True)
    elif sort_by == "reviews":
        results.sort(key=lambda x: x["review_count"], reverse=True)
    else:
        results.sort(key=lambda x: x["rating"], reverse=True)

    return [StylistProfileResponse(**s) for s in results]


@router.get("/stylists/{stylist_id}", response_model=StylistProfileResponse)
async def get_stylist(stylist_id: str):
    """Get a stylist profile by ID."""
    record = _stylist_profiles.get(stylist_id)
    if not record:
        raise HTTPException(status_code=404, detail="Stylist not found")
    return StylistProfileResponse(**record)


@router.post("/stylists", response_model=StylistProfileResponse)
async def create_stylist_profile(
    data: StylistProfileCreate,
    x_user_id: str = Header(default="demo-stylist-001"),
):
    """Create a new stylist profile."""
    record = {
        "id": str(uuid.uuid4()),
        "profile_id": x_user_id,
        "display_name": "New Stylist",
        "avatar_url": None,
        **data.model_dump(),
        "rating": 0.0,
        "review_count": 0,
        "created_at": datetime.now(timezone.utc),
    }
    _stylist_profiles[record["id"]] = record
    return StylistProfileResponse(**record)


@router.put("/stylists/{stylist_id}", response_model=StylistProfileResponse)
async def update_stylist_profile(
    stylist_id: str,
    data: StylistProfileUpdate,
    x_user_id: str = Header(default="demo-stylist-001"),
):
    """Update a stylist profile."""
    record = _stylist_profiles.get(stylist_id)
    if not record:
        raise HTTPException(status_code=404, detail="Stylist not found")

    update_data = data.model_dump(exclude_unset=True)
    record.update(update_data)
    _stylist_profiles[stylist_id] = record
    return StylistProfileResponse(**record)
