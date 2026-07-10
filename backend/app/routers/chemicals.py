"""
Chemicals router — handles AI-powered chemical formulation calculation.
"""

from fastapi import APIRouter, Query
from datetime import datetime, timezone

from app.models.schemas import ChemicalCalculationRequest, ChemicalCalculationResponse
from app.services.chemical_calculator import calculate_formulation, get_all_agents
from app.routers.stylists import _stylist_inventories

router = APIRouter()


@router.post("/chemicals/calculate", response_model=ChemicalCalculationResponse)
async def calculate_chemicals(data: ChemicalCalculationRequest):
    """Calculate optimal chemical formulation based on hair condition."""
    stylist_inventory = []
    if data.stylist_id and data.stylist_id in _stylist_inventories:
        stylist_inventory = _stylist_inventories[data.stylist_id].get("items", [])

    result = calculate_formulation(
        damage_level=data.damage_level,
        bleach_count=data.bleach_count,
        target_treatment=data.target_treatment,
        target_tone=data.target_tone,
        has_straightening=data.has_straightening,
        has_perm=data.has_perm,
        has_black_dye=data.has_black_dye,
        hair_length=data.hair_length,
        perm_count=data.perm_count,
        wants_design_color=data.wants_design_color,
        stylist_inventory=stylist_inventory,
    )
    return ChemicalCalculationResponse(**result)


@router.get("/chemicals/agents")
async def list_agents(
    agent_type: str | None = Query(None, description="Filter by type: alkaline, acidic, bleach, developer, treatment, neutral"),
):
    """List all available chemical agents."""
    agents = get_all_agents()
    if agent_type:
        agents = [a for a in agents if a["type"] == agent_type.lower()]
    return agents
