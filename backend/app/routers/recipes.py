"""
Recipes router — handles AI-generated treatment recipe retrieval.
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import uuid

from app.models.schemas import RecipeResponse
from app.services.recipe_generator import generate_recipe

router = APIRouter()

# In-memory store
_recipes: dict[str, dict] = {}


@router.get("/recipes/{booking_id}", response_model=RecipeResponse)
async def get_recipe(booking_id: str):
    """Get the AI-generated recipe for a booking."""
    # Check if recipe exists for this booking
    recipe = None
    for r in _recipes.values():
        if r["booking_id"] == booking_id:
            recipe = r
            break

    if not recipe:
        # Generate a demo recipe
        recipe = await generate_recipe(booking_id)
        _recipes[recipe["id"]] = recipe

    return RecipeResponse(**recipe)


@router.post("/recipes/{booking_id}/regenerate", response_model=RecipeResponse)
async def regenerate_recipe(booking_id: str):
    """Re-generate the AI recipe for a booking."""
    recipe = await generate_recipe(booking_id)
    _recipes[recipe["id"]] = recipe
    return RecipeResponse(**recipe)
