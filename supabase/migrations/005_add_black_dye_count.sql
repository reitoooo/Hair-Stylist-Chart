-- =============================================
-- HairMatch — Add Black Dye Count
-- =============================================

ALTER TABLE user_questionnaires
    ADD COLUMN IF NOT EXISTS black_dye_count INTEGER NOT NULL DEFAULT 0
        CHECK (black_dye_count >= 0 AND black_dye_count <= 20);
