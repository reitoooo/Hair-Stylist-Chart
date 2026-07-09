-- =============================================
-- HairMatch — Expanded Questionnaire Fields
-- Adds detailed treatment history for better assessment
-- =============================================

-- Straightening history details
ALTER TABLE user_questionnaires
    ADD COLUMN IF NOT EXISTS straightening_date TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS straightening_count INTEGER NOT NULL DEFAULT 0
        CHECK (straightening_count >= 0 AND straightening_count <= 20);

-- Perm history details
ALTER TABLE user_questionnaires
    ADD COLUMN IF NOT EXISTS perm_date TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS perm_count INTEGER NOT NULL DEFAULT 0
        CHECK (perm_count >= 0 AND perm_count <= 20),
    ADD COLUMN IF NOT EXISTS perm_count_over_5 BOOLEAN NOT NULL DEFAULT FALSE;

-- Previous treatment chemicals
ALTER TABLE user_questionnaires
    ADD COLUMN IF NOT EXISTS previous_chemicals TEXT DEFAULT '';

-- Perm feasibility notes (for stylist reference)
ALTER TABLE user_questionnaires
    ADD COLUMN IF NOT EXISTS perm_feasibility_notes TEXT DEFAULT '';
