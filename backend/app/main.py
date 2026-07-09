"""
FastAPI application entrypoint.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import questionnaire, stylists, bookings, recipes, chat, chemicals, soap, allergy

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="Hairstyle Recommendation & Stylist Matching API",
    version="0.2.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(questionnaire.router, prefix="/api", tags=["Questionnaire"])
app.include_router(stylists.router, prefix="/api", tags=["Stylists"])
app.include_router(bookings.router, prefix="/api", tags=["Bookings"])
app.include_router(recipes.router, prefix="/api", tags=["Recipes"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(chemicals.router, prefix="/api", tags=["Chemicals"])
app.include_router(soap.router, prefix="/api", tags=["SOAP Charts"])
app.include_router(allergy.router, prefix="/api", tags=["Allergy"])


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": settings.app_name}
