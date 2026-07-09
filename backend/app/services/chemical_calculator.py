"""
Chemical Calculator Service.

Calculates optimal chemical formulations for hair treatments based on:
- Hair damage level and history
- Target color/style
- Existing treatment history (bleach, perm, straightening)

Uses rule-based logic for MVP. Can be replaced with ML model later.
"""

from datetime import datetime, timezone
import uuid


# Chemical agent database
AGENTS_DATABASE = [
    {
        "id": "agent-alkaline-high",
        "name": "High-Alkaline Oxidation Color",
        "type": "alkaline",
        "strength": "high",
        "ph_range": "9.0-11.0",
        "description": "For resistant/virgin hair needing maximum lift. Strong color penetration.",
        "risk_level": 3,
        "suitable_damage_max": 2,
    },
    {
        "id": "agent-alkaline-medium",
        "name": "Medium-Alkaline Oxidation Color",
        "type": "alkaline",
        "strength": "medium",
        "ph_range": "8.0-9.0",
        "description": "Standard coloring agent. Balanced lift and conditioning.",
        "risk_level": 2,
        "suitable_damage_max": 3,
    },
    {
        "id": "agent-alkaline-low",
        "name": "Low-Alkaline Color",
        "type": "alkaline",
        "strength": "low",
        "ph_range": "7.5-8.0",
        "description": "Gentle coloring for pre-treated hair. Minimal additional damage.",
        "risk_level": 1,
        "suitable_damage_max": 4,
    },
    {
        "id": "agent-acidic",
        "name": "Acidic Color (Acid-based)",
        "type": "acidic",
        "strength": "low",
        "ph_range": "3.5-6.0",
        "description": "For highly damaged hair. Deposits color without lifting. Heals cuticle.",
        "risk_level": 0,
        "suitable_damage_max": 5,
    },
    {
        "id": "agent-neutral-perm",
        "name": "Neutral Perm Solution (Cysteamine)",
        "type": "neutral",
        "strength": "medium",
        "ph_range": "6.5-7.5",
        "description": "Low-damage perm agent using cysteamine. Suitable for damaged hair.",
        "risk_level": 1,
        "suitable_damage_max": 4,
    },
    {
        "id": "agent-alkaline-perm",
        "name": "Alkaline Perm Solution (Thioglycolate)",
        "type": "alkaline",
        "strength": "high",
        "ph_range": "8.5-9.5",
        "description": "Strong perm agent for resistant hair. Maximum curl definition.",
        "risk_level": 3,
        "suitable_damage_max": 2,
    },
    {
        "id": "agent-bleach-standard",
        "name": "Standard Bleach Powder",
        "type": "bleach",
        "strength": "high",
        "ph_range": "9.0-11.5",
        "description": "Standard bleach for maximum lightening. Use with appropriate developer.",
        "risk_level": 4,
        "suitable_damage_max": 3,
    },
    {
        "id": "agent-bleach-care",
        "name": "Care Bleach (Bond-Reinforced)",
        "type": "bleach",
        "strength": "medium",
        "ph_range": "9.0-10.5",
        "description": "Damage-reducing bleach with bond protection (e.g., OLAPLEX-infused). Up to 98% less breakage.",
        "risk_level": 2,
        "suitable_damage_max": 4,
    },
    {
        "id": "agent-developer-3",
        "name": "3% Developer (10 Vol)",
        "type": "developer",
        "strength": "low",
        "ph_range": "2.5-3.5",
        "description": "For toning, depositing color, or gentle processing.",
        "risk_level": 0,
        "suitable_damage_max": 5,
    },
    {
        "id": "agent-developer-6",
        "name": "6% Developer (20 Vol)",
        "type": "developer",
        "strength": "medium",
        "ph_range": "2.5-3.5",
        "description": "Standard developer for 1-2 levels of lift.",
        "risk_level": 1,
        "suitable_damage_max": 4,
    },
    {
        "id": "agent-developer-9",
        "name": "9% Developer (30 Vol)",
        "type": "developer",
        "strength": "high",
        "ph_range": "2.5-3.5",
        "description": "For 2-3 levels of lift. Use only on healthy hair.",
        "risk_level": 2,
        "suitable_damage_max": 2,
    },
    {
        "id": "agent-treatment-ppt",
        "name": "PPT Bond Repair Treatment",
        "type": "treatment",
        "strength": "low",
        "ph_range": "4.0-5.5",
        "description": "Protein-based treatment for rebuilding damaged bonds mid-process.",
        "risk_level": 0,
        "suitable_damage_max": 5,
    },
    {
        "id": "agent-treatment-olaplex",
        "name": "OLAPLEX No.1 Bond Multiplier",
        "type": "treatment",
        "strength": "low",
        "ph_range": "3.0-4.0",
        "description": "Add to bleach/color to protect bonds during processing.",
        "risk_level": 0,
        "suitable_damage_max": 5,
    },
]

# Developer volume recommendations
DEVELOPER_MAP = {
    "deposit_only": "agent-developer-3",
    "gentle_lift": "agent-developer-3",
    "standard_lift": "agent-developer-6",
    "moderate_lift": "agent-developer-6",
    "high_lift": "agent-developer-9",
}


def calculate_formulation(
    damage_level: int,
    bleach_count: int,
    target_treatment: str,  # "color", "bleach", "perm", "straightening"
    target_tone: str = "medium",  # "dark", "medium", "light", "high_tone"
    has_straightening: bool = False,
    has_perm: bool = False,
    has_black_dye: bool = False,
    hair_length: str = "medium",
    perm_count: int = 0,
) -> dict:
    """
    Calculate the optimal chemical formulation based on hair condition.

    Returns a dict with:
    - recommended_agents: list of agent recommendations
    - developer_volume: recommended developer
    - processing_time_minutes: estimated processing time
    - risk_score: 0-10 overall risk score
    - risk_factors: list of identified risks
    - pre_treatments: recommended pre-treatments
    - post_treatments: recommended post-treatments
    - warnings: critical warnings
    - alkaline_acidic_ratio: visual ratio indicator
    """
    recommended_agents = []
    risk_factors = []
    warnings = []
    pre_treatments = []
    post_treatments = []
    processing_time = 0
    risk_score = 0

    # ─── Base Risk Calculation ───
    risk_score += damage_level * 1.2
    risk_score += min(bleach_count * 0.8, 4)

    if has_straightening and target_treatment == "perm":
        risk_score += 3
        warnings.append(
            "CRITICAL: Straightened hair + perm is extremely high risk. "
            "Chemical bonds may have been permanently altered. "
            "Recommend strand test before proceeding."
        )
        risk_factors.append("Straightening + Perm combination")

    if has_perm and target_treatment == "bleach":
        risk_score += 2
        risk_factors.append("Permed hair + Bleach — increased breakage risk")

    if has_black_dye and target_treatment in ("color", "bleach"):
        risk_score += 1.5
        risk_factors.append("Black dye history — requires extra lift time, uneven results possible")

    if perm_count >= 5:
        risk_score += 2
        risk_factors.append("5+ perm treatments — hair structure may be significantly weakened")

    # ─── Treatment-Specific Formulation ───
    if target_treatment == "color":
        if damage_level >= 4:
            recommended_agents.append({
                "agent": _get_agent("agent-acidic"),
                "role": "Primary Color Agent",
                "mix_ratio": "1:1 with developer",
                "reason": "High damage level requires acidic color to prevent further damage",
            })
            developer_id = "agent-developer-3"
            processing_time = 30
        elif damage_level >= 3 or bleach_count >= 3:
            recommended_agents.append({
                "agent": _get_agent("agent-alkaline-low"),
                "role": "Primary Color Agent",
                "mix_ratio": "1:1 with developer",
                "reason": "Moderate damage — low-alkaline agent minimizes further stress",
            })
            developer_id = "agent-developer-3" if target_tone in ("dark", "medium") else "agent-developer-6"
            processing_time = 35
        elif target_tone in ("light", "high_tone"):
            recommended_agents.append({
                "agent": _get_agent("agent-alkaline-medium"),
                "role": "Primary Color Agent",
                "mix_ratio": "1:1.5 with developer",
                "reason": "Healthy hair with target lift requires medium-alkaline agent",
            })
            developer_id = "agent-developer-6"
            processing_time = 40
        else:
            recommended_agents.append({
                "agent": _get_agent("agent-alkaline-medium"),
                "role": "Primary Color Agent",
                "mix_ratio": "1:1 with developer",
                "reason": "Standard color application for healthy hair",
            })
            developer_id = "agent-developer-6" if target_tone == "medium" else "agent-developer-3"
            processing_time = 35

        recommended_agents.append({
            "agent": _get_agent(developer_id),
            "role": "Developer (Oxidizer)",
            "mix_ratio": "See primary agent ratio",
            "reason": f"Appropriate volume for {target_tone} tone target",
        })

    elif target_treatment == "bleach":
        if damage_level >= 3 or bleach_count >= 2:
            recommended_agents.append({
                "agent": _get_agent("agent-bleach-care"),
                "role": "Primary Bleach Agent",
                "mix_ratio": "1:2 with developer",
                "reason": "Care bleach recommended due to existing damage/bleach history",
            })
        else:
            recommended_agents.append({
                "agent": _get_agent("agent-bleach-standard"),
                "role": "Primary Bleach Agent",
                "mix_ratio": "1:2 with developer",
                "reason": "Standard bleach suitable for hair condition",
            })

        developer_id = "agent-developer-6" if damage_level >= 3 else "agent-developer-9"
        if damage_level >= 4:
            developer_id = "agent-developer-3"

        recommended_agents.append({
            "agent": _get_agent(developer_id),
            "role": "Developer (Oxidizer)",
            "mix_ratio": "See primary agent ratio",
            "reason": "Developer volume adjusted for hair condition",
        })

        processing_time = 45 if damage_level < 3 else 35
        pre_treatments.append("OLAPLEX No.0 or equivalent bond reinforcement (5 min)")
        recommended_agents.append({
            "agent": _get_agent("agent-treatment-olaplex"),
            "role": "Bond Protection (add to bleach mix)",
            "mix_ratio": "1.5ml per 30g bleach",
            "reason": "Protect bonds during lightening process",
        })

    elif target_treatment == "perm":
        if damage_level >= 3 or has_straightening:
            recommended_agents.append({
                "agent": _get_agent("agent-neutral-perm"),
                "role": "Primary Perm Agent",
                "mix_ratio": "Apply directly to rods",
                "reason": "Neutral perm agent — gentler on pre-treated or damaged hair",
            })
            processing_time = 20
        else:
            recommended_agents.append({
                "agent": _get_agent("agent-alkaline-perm"),
                "role": "Primary Perm Agent",
                "mix_ratio": "Apply directly to rods",
                "reason": "Alkaline perm for maximum curl definition on healthy hair",
            })
            processing_time = 15

        if damage_level >= 2:
            pre_treatments.append("PPT protein spray on mid-lengths and ends before rolling")

    # ─── Pre/Post Treatments ───
    if damage_level >= 3:
        pre_treatments.append("CMC (Ceramide) pre-treatment to reinforce cuticle layer")

    if damage_level >= 2 or bleach_count >= 1:
        post_treatments.append("OLAPLEX No.2 Bond Perfector — 10 min after rinse")
        recommended_agents.append({
            "agent": _get_agent("agent-treatment-ppt"),
            "role": "Mid-Process Treatment",
            "mix_ratio": "Apply between bleach and toner",
            "reason": "Rebuild protein bonds between processing steps",
        })

    post_treatments.append("pH-balancing acid rinse to close cuticles")
    post_treatments.append("Moisturizing treatment mask — 5-10 min")

    # ─── Hair Length Time Adjustment ───
    length_multiplier = {"short": 0.7, "bob": 0.85, "medium": 1.0, "long": 1.2, "very_long": 1.4}
    processing_time = int(processing_time * length_multiplier.get(hair_length, 1.0))

    # ─── Alkaline/Acidic Ratio ───
    alkaline_count = sum(1 for a in recommended_agents if a["agent"].get("type") in ("alkaline", "bleach"))
    acidic_count = sum(1 for a in recommended_agents if a["agent"].get("type") in ("acidic", "treatment"))
    total = alkaline_count + acidic_count
    alkaline_ratio = round(alkaline_count / total * 100) if total > 0 else 50
    acidic_ratio = 100 - alkaline_ratio

    # Cap risk score
    risk_score = round(min(risk_score, 10), 1)

    return {
        "id": str(uuid.uuid4()),
        "recommended_agents": recommended_agents,
        "processing_time_minutes": processing_time,
        "risk_score": risk_score,
        "risk_factors": risk_factors,
        "warnings": warnings,
        "pre_treatments": pre_treatments,
        "post_treatments": post_treatments,
        "alkaline_acidic_ratio": {
            "alkaline_percent": alkaline_ratio,
            "acidic_percent": acidic_ratio,
        },
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


def get_all_agents() -> list[dict]:
    """Return the full chemical agent database."""
    return AGENTS_DATABASE


def _get_agent(agent_id: str) -> dict:
    """Look up an agent by ID from the database."""
    for agent in AGENTS_DATABASE:
        if agent["id"] == agent_id:
            return agent
    return {"id": agent_id, "name": "Unknown Agent", "type": "unknown"}
