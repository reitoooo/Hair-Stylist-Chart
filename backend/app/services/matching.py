"""
Stylist Matching Service.

Rule-based matching algorithm that scores stylists based on:
- Specialty relevance to desired style
- Product brand availability
- Experience level
- Rating
"""

from app.models.schemas import MatchedStylist, StylistProfileResponse


def calculate_match_score(
    stylist: dict,
    desired_specialties: list[str],
    required_brands: list[str] | None = None,
) -> tuple[float, list[str]]:
    """
    Calculate a match score (0-1) between a stylist and user requirements.

    Returns (score, reasons).
    """
    score = 0.0
    reasons = []

    # Specialty overlap (40% weight)
    stylist_specialties = [s.lower() for s in stylist.get("specialties", [])]
    if desired_specialties:
        overlap = sum(1 for s in desired_specialties if s.lower() in stylist_specialties)
        specialty_score = min(overlap / max(len(desired_specialties), 1), 1.0)
        score += specialty_score * 0.4
        if overlap > 0:
            matched = [s for s in desired_specialties if s.lower() in stylist_specialties]
            reasons.append(f"Matches {overlap} specialty/ies: {', '.join(matched)}")

    # Product brand availability (20% weight)
    if required_brands:
        stylist_brands = [b.upper() for b in stylist.get("product_brands", [])]
        brand_overlap = sum(1 for b in required_brands if b.upper() in stylist_brands)
        brand_score = min(brand_overlap / max(len(required_brands), 1), 1.0)
        score += brand_score * 0.2
        if brand_overlap > 0:
            reasons.append(f"Has {brand_overlap} required product brand(s)")
    else:
        score += 0.1  # Neutral when no brand requirement

    # Experience (20% weight)
    years = stylist.get("years_experience", 0)
    exp_score = min(years / 10.0, 1.0)
    score += exp_score * 0.2
    if years >= 5:
        reasons.append(f"{years} years of experience")

    # Rating (20% weight)
    rating = stylist.get("rating", 0)
    rating_score = rating / 5.0
    score += rating_score * 0.2
    if rating >= 4.5:
        reasons.append(f"Highly rated ({rating}★)")

    return round(score, 3), reasons


def match_stylists(
    stylists: list[dict],
    desired_specialties: list[str],
    required_brands: list[str] | None = None,
    limit: int = 10,
) -> list[dict]:
    """
    Match and rank stylists based on user requirements.

    Returns list of {stylist, match_score, match_reasons} sorted by score desc.
    """
    results = []
    for stylist in stylists:
        score, reasons = calculate_match_score(stylist, desired_specialties, required_brands)
        results.append({
            "stylist": stylist,
            "match_score": score,
            "match_reasons": reasons,
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:limit]
