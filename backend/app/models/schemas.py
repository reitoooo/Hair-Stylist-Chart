"""
Pydantic schemas for API request/response models.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


# ──────────────────────────────────────────────
# Enums
# ──────────────────────────────────────────────

class UserRole(str, Enum):
    USER = "user"
    STYLIST = "stylist"


class HairLength(str, Enum):
    SHORT = "short"
    BOB = "bob"
    MEDIUM = "medium"
    LONG = "long"
    VERY_LONG = "very_long"


class BookingStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


# ──────────────────────────────────────────────
# Profiles
# ──────────────────────────────────────────────

class ProfileBase(BaseModel):
    display_name: str
    role: UserRole
    avatar_url: str | None = None


class ProfileResponse(ProfileBase):
    id: str
    created_at: datetime | None = None


# ──────────────────────────────────────────────
# Questionnaire (Expanded)
# ──────────────────────────────────────────────

class QuestionnaireCreate(BaseModel):
    hair_length: HairLength
    bleach_count: int = Field(ge=0, le=10, description="Number of bleach treatments in last 2 years")
    has_black_dye: bool = Field(description="Whether black dye was used recently")
    has_straightening: bool = Field(description="Whether chemical straightening was done")
    has_perm: bool = Field(default=False, description="Whether perm treatment was done")
    current_hair_color: str = Field(description="Current hair color description")
    damage_level: int = Field(ge=1, le=5, description="Self-assessed damage level 1-5")
    additional_notes: str = ""
    # Expanded fields
    straightening_date: str = Field(default="", description="When the last straightening was done")
    straightening_count: int = Field(default=0, ge=0, le=20, description="Total straightening treatments")
    perm_date: str = Field(default="", description="When the last perm was done")
    perm_count: int = Field(default=0, ge=0, le=20, description="Total perm treatments")
    perm_count_over_5: bool = Field(default=False, description="Whether perm count exceeds 5")
    previous_chemicals: str = Field(default="", description="Previously used chemicals/agents")
    perm_feasibility_notes: str = Field(default="", description="Notes about perm feasibility")
    black_dye_count: int = Field(default=0, ge=0, le=20, description="Total black dye treatments")


class QuestionnaireResponse(QuestionnaireCreate):
    id: str
    user_id: str
    created_at: datetime


# ──────────────────────────────────────────────
# Desired Styles
# ──────────────────────────────────────────────

class DesiredStyleCreate(BaseModel):
    image_url: str
    description: str = ""
    questionnaire_id: str


class DesiredStyleResponse(DesiredStyleCreate):
    id: str
    user_id: str
    created_at: datetime


# ──────────────────────────────────────────────
# Stylist Profiles
# ──────────────────────────────────────────────

class StylistProfileCreate(BaseModel):
    bio: str = ""
    specialties: list[str] = []
    product_brands: list[str] = []
    years_experience: int = 0
    location: str = ""
    portfolio_urls: list[str] = []


class StylistProfileUpdate(BaseModel):
    bio: str | None = None
    specialties: list[str] | None = None
    product_brands: list[str] | None = None
    years_experience: int | None = None
    location: str | None = None
    portfolio_urls: list[str] | None = None


class StylistProfileResponse(StylistProfileCreate):
    id: str
    profile_id: str
    display_name: str
    avatar_url: str | None = None
    rating: float = 0.0
    review_count: int = 0
    created_at: datetime


# ──────────────────────────────────────────────
# Bookings
# ──────────────────────────────────────────────

class BookingCreate(BaseModel):
    stylist_id: str
    desired_style_id: str
    questionnaire_id: str
    preferred_datetime: datetime
    message: str = ""


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingResponse(BaseModel):
    id: str
    user_id: str
    stylist_id: str
    desired_style_id: str
    questionnaire_id: str
    preferred_datetime: datetime
    status: BookingStatus
    ai_recipe_id: str | None = None
    message: str = ""
    created_at: datetime

    # Nested data (populated on detail views)
    questionnaire: QuestionnaireResponse | None = None
    desired_style: DesiredStyleResponse | None = None
    stylist: StylistProfileResponse | None = None


# ──────────────────────────────────────────────
# AI Recipes
# ──────────────────────────────────────────────

class RecipeResponse(BaseModel):
    id: str
    booking_id: str
    recipe_text: str
    recommended_products: list[dict] = []
    procedure_steps: list[str] = []
    estimated_time_minutes: int = 0
    risk_notes: str = ""
    disclaimer: str = "This AI-generated recipe is for reference only. Final treatment decisions are the responsibility of the stylist."
    created_at: datetime


# ──────────────────────────────────────────────
# Chat
# ──────────────────────────────────────────────

class ChatMessageCreate(BaseModel):
    booking_id: str
    content: str


class ChatMessageResponse(BaseModel):
    id: str
    booking_id: str
    sender_id: str
    sender_name: str = ""
    content: str
    created_at: datetime


# ──────────────────────────────────────────────
# Matching
# ──────────────────────────────────────────────

class MatchRequest(BaseModel):
    questionnaire_id: str
    desired_style_id: str


class MatchedStylist(BaseModel):
    stylist: StylistProfileResponse
    match_score: float = Field(ge=0, le=1, description="Match score 0-1")
    match_reasons: list[str] = []


# ──────────────────────────────────────────────
# Chemical Calculation (Feature 4)
# ──────────────────────────────────────────────

class ChemicalCalculationRequest(BaseModel):
    damage_level: int = Field(ge=1, le=5, description="Hair damage level 1-5")
    bleach_count: int = Field(ge=0, le=10, description="Number of bleach treatments")
    target_treatment: str = Field(description="Treatment type: color, bleach, perm, straightening")
    target_tone: str = Field(default="medium", description="Target tone: dark, medium, light, high_tone")
    has_straightening: bool = False
    has_perm: bool = False
    has_black_dye: bool = False
    hair_length: str = "medium"
    perm_count: int = Field(default=0, ge=0, description="Number of perm treatments")


class ChemicalCalculationResponse(BaseModel):
    id: str
    recommended_agents: list[dict] = []
    processing_time_minutes: int = 0
    risk_score: float = Field(ge=0, le=10, description="Overall risk score 0-10")
    risk_factors: list[str] = []
    warnings: list[str] = []
    pre_treatments: list[str] = []
    post_treatments: list[str] = []
    alkaline_acidic_ratio: dict = {}
    created_at: str


# ──────────────────────────────────────────────
# SOAP Charts (Feature 5)
# ──────────────────────────────────────────────

class SOAPChartCreate(BaseModel):
    booking_id: str
    stylist_id: str
    subjective: str = ""
    objective: str = ""
    assessment: str = ""
    plan: str = ""


class SOAPChartUpdate(BaseModel):
    subjective: str | None = None
    objective: str | None = None
    assessment: str | None = None
    plan: str | None = None


class SOAPChartResponse(BaseModel):
    id: str
    booking_id: str
    stylist_id: str
    subjective: str
    objective: str
    assessment: str
    plan: str
    is_ai_generated: bool = False
    created_at: datetime | str
    updated_at: datetime | str


# ──────────────────────────────────────────────
# Allergy Checklists (Feature 6)
# ──────────────────────────────────────────────

class AllergyChecklistCreate(BaseModel):
    questionnaire_id: str = ""
    has_skin_trouble: bool = False
    skin_trouble_detail: str = ""
    has_allergy: bool = False
    allergy_detail: str = ""
    has_patch_test: bool = False
    patch_test_result: str = ""
    has_scalp_sensitivity: bool = False
    has_previous_reaction: bool = False
    previous_reaction_detail: str = ""
    consent_acknowledged: bool = False


class AllergyChecklistResponse(AllergyChecklistCreate):
    id: str
    user_id: str
    created_at: datetime
