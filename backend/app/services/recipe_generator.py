"""
AI Recipe Generator Service.

Generates treatment procedure recipes based on:
- User questionnaire data (hair history, condition)
- Desired style image analysis
- Knowledge base of color formulations
- Stylist's available products

For MVP, this uses a structured demo recipe when OpenAI API key is not configured.
"""

from datetime import datetime, timezone
import uuid


# Demo recipe templates for MVP (used when OpenAI is not configured)
_DEMO_RECIPES = [
    {
        "recipe_text": """## Treatment Recipe: High-Tone Beige Color

### Pre-Assessment
Based on the client's questionnaire, the hair has undergone 2 previous bleach treatments 
with no black dye history. Current damage level is moderate (Level 3). 
The hair length is medium, making this a manageable transformation.

### Recommended Procedure

**Step 1: Hair Condition Check (10 min)**
- Perform strand test on most damaged area
- Check elasticity and porosity
- Confirm target lift level is achievable

**Step 2: Pre-Treatment (5 min)**
- Apply OLAPLEX No.0 or TOKIO INKARAMI to reinforce bonds
- Let absorb for 5 minutes without heat

**Step 3: Bleach Application (45 min)**
- Mix: WELLA Blondor Multi Blonde Powder + 6% developer (1:2 ratio)
- Apply from mid-lengths to ends first (previously bleached areas need less time)
- Then apply to roots
- Process under natural heat, check every 10 minutes
- Target: Level 15-16 (pale yellow)

**Step 4: Toner Application (25 min)**
- After shampooing bleach, towel dry
- Mix: THROW Color 9-Beige + 9-Monoetone (2:1) + 3% OXY
- Apply evenly from roots to ends
- Process 20-25 minutes at room temperature

**Step 5: Post-Treatment (15 min)**
- Rinse thoroughly
- Apply OLAPLEX No.2 for 10 minutes
- Follow with moisturizing treatment
- Blow dry with cool air to seal cuticle""",
        "recommended_products": [
            {"name": "WELLA Blondor Multi Blonde", "type": "Bleach Powder", "usage": "Step 3"},
            {"name": "OLAPLEX No.0 + No.2", "type": "Bond Treatment", "usage": "Steps 2 & 5"},
            {"name": "THROW Color 9-Beige", "type": "Color Agent", "usage": "Step 4"},
            {"name": "THROW Color 9-Monotone", "type": "Color Agent", "usage": "Step 4"},
        ],
        "procedure_steps": [
            "Hair condition check & strand test",
            "Pre-treatment bond reinforcement",
            "Bleach application (root-separate technique)",
            "Toner application (beige formula)",
            "Post-treatment & finish",
        ],
        "estimated_time_minutes": 100,
        "risk_notes": "With 2 previous bleaches, mid-lengths to ends may be fragile. Reduce bleach processing time for these areas. If strand test shows excessive breakage, consider stopping at a lower lift level and using a darker toner shade.",
    },
    {
        "recipe_text": """## Treatment Recipe: Ash Gray Balayage

### Pre-Assessment
Client has long hair with 1 previous bleach treatment and no chemical straightening history.
Damage level is low (Level 2). The desired style is a natural-gradient balayage with ash gray tones.

### Recommended Procedure

**Step 1: Consultation Confirmation (10 min)**
- Confirm balayage placement with client
- Map out lightened sections (focusing on face-framing pieces and ends)
- Set expectation for processing time

**Step 2: Section & Prep (10 min)**
- Section hair into 4 quadrants
- Clip up top sections
- Prepare foils for balayage technique

**Step 3: Balayage Bleach Application (60 min)**
- Mix: WELLA Blondor + 6% developer for virgin sections, 3% for previously bleached
- Paint freehand starting 3-4cm from roots
- Use foils to separate sections
- Feather the color at the transition point for seamless blend
- Process and check every 15 minutes
- Target: Level 14-15 (light yellow)

**Step 4: Toning (20 min)**
- Mix: ADMIIO Color MT-9 (Matte) + A-9 (Ash) at 3:1 ratio + 3% OXY
- Apply to lightened sections only
- Process 15-20 minutes

**Step 5: Gloss Treatment (15 min)**
- Apply clear gloss treatment all over for shine
- Process 10 minutes
- Rinse and deep condition""",
        "recommended_products": [
            {"name": "WELLA Blondor", "type": "Bleach Powder", "usage": "Step 3"},
            {"name": "ADMIIO MT-9 Matte", "type": "Color Agent", "usage": "Step 4"},
            {"name": "ADMIIO A-9 Ash", "type": "Color Agent", "usage": "Step 4"},
            {"name": "MILBON Linkage Treatment", "type": "Post Treatment", "usage": "Step 5"},
        ],
        "procedure_steps": [
            "Consultation & balayage mapping",
            "Sectioning & prep",
            "Freehand balayage bleach application",
            "Ash gray toner application",
            "Clear gloss & deep conditioning",
        ],
        "estimated_time_minutes": 115,
        "risk_notes": "Balayage requires careful freehand technique. The transition zone must be blended naturally. For first-time balayage clients, start with softer contrast and build up in future sessions.",
    },
]


async def generate_recipe(booking_id: str, recipe_index: int = 0) -> dict:
    """
    Generate an AI treatment recipe for a booking.

    In production, this would:
    1. Fetch questionnaire data and desired style image
    2. Analyze image with OpenAI Vision API
    3. Query ChromaDB for relevant recipe knowledge
    4. Generate customized recipe via GPT-4o

    For MVP, returns structured demo recipe data.
    """
    template = _DEMO_RECIPES[recipe_index % len(_DEMO_RECIPES)]

    recipe = {
        "id": str(uuid.uuid4()),
        "booking_id": booking_id,
        **template,
        "disclaimer": "⚠️ This AI-generated recipe is for reference only. The actual treatment should be adjusted based on the stylist's professional assessment of the client's hair condition. Final treatment decisions are the responsibility of the stylist.",
        "created_at": datetime.now(timezone.utc),
    }

    return recipe
