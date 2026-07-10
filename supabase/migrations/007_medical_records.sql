-- =============================================
-- Medical Records (Feature 8)
-- Stores actual recipes, before/after images, and private notes
-- =============================================

CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    stylist_id UUID NOT NULL REFERENCES stylist_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    actual_recipe TEXT NOT NULL DEFAULT '',
    before_image_urls TEXT[] DEFAULT '{}',
    after_image_urls TEXT[] DEFAULT '{}',
    private_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medical_records_booking ON medical_records(booking_id);
CREATE INDEX idx_medical_records_user ON medical_records(user_id);
CREATE INDEX idx_medical_records_stylist ON medical_records(stylist_id);

-- RLS: Security policies
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own medical records" ON medical_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Stylists can read medical records for their clients" ON medical_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stylist_profiles sp
            WHERE sp.id = medical_records.stylist_id
            AND sp.profile_id = auth.uid()
        )
    );

CREATE POLICY "Stylists can create medical records" ON medical_records
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM stylist_profiles sp
            WHERE sp.id = medical_records.stylist_id
            AND sp.profile_id = auth.uid()
        )
    );

CREATE POLICY "Stylists can update own medical records" ON medical_records
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM stylist_profiles sp
            WHERE sp.id = medical_records.stylist_id
            AND sp.profile_id = auth.uid()
        )
    );
