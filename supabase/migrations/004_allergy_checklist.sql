-- =============================================
-- HairMatch — Allergy & Risk Management Checklist
-- Pre-treatment safety screening to prevent chemical accidents
-- =============================================

CREATE TABLE allergy_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    questionnaire_id UUID REFERENCES user_questionnaires(id) ON DELETE SET NULL,
    has_skin_trouble BOOLEAN NOT NULL DEFAULT FALSE,
    skin_trouble_detail TEXT DEFAULT '',
    has_allergy BOOLEAN NOT NULL DEFAULT FALSE,
    allergy_detail TEXT DEFAULT '',
    has_patch_test BOOLEAN NOT NULL DEFAULT FALSE,
    patch_test_result TEXT DEFAULT '',
    has_scalp_sensitivity BOOLEAN NOT NULL DEFAULT FALSE,
    has_previous_reaction BOOLEAN NOT NULL DEFAULT FALSE,
    previous_reaction_detail TEXT DEFAULT '',
    consent_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_allergy_checklists_user ON allergy_checklists(user_id);
CREATE INDEX idx_allergy_checklists_questionnaire ON allergy_checklists(questionnaire_id);

-- RLS: Users can manage their own checklists
ALTER TABLE allergy_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own allergy checklists" ON allergy_checklists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own allergy checklists" ON allergy_checklists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Booked stylists only can read allergy data
CREATE POLICY "Booked stylists can read allergy checklists" ON allergy_checklists
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings b
            JOIN stylist_profiles sp ON b.stylist_id = sp.id
            WHERE b.questionnaire_id = allergy_checklists.questionnaire_id
            AND sp.profile_id = auth.uid()
        )
    );
