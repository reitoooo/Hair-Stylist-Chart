-- =============================================
-- HairMatch — SOAP Charts
-- Medical-style charting for client records
-- S = Subjective, O = Objective, A = Assessment, P = Plan
-- =============================================

CREATE TABLE soap_charts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    stylist_id UUID NOT NULL REFERENCES stylist_profiles(id) ON DELETE CASCADE,
    subjective TEXT NOT NULL DEFAULT '',
    objective TEXT NOT NULL DEFAULT '',
    assessment TEXT NOT NULL DEFAULT '',
    plan TEXT NOT NULL DEFAULT '',
    is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_soap_charts_booking ON soap_charts(booking_id);
CREATE INDEX idx_soap_charts_stylist ON soap_charts(stylist_id);

-- RLS: Only the assigned stylist can read/write SOAP charts
ALTER TABLE soap_charts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stylists can read own SOAP charts" ON soap_charts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stylist_profiles sp
            WHERE sp.id = soap_charts.stylist_id
            AND sp.profile_id = auth.uid()
        )
    );

CREATE POLICY "Stylists can create SOAP charts" ON soap_charts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM stylist_profiles sp
            WHERE sp.id = soap_charts.stylist_id
            AND sp.profile_id = auth.uid()
        )
    );

CREATE POLICY "Stylists can update own SOAP charts" ON soap_charts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM stylist_profiles sp
            WHERE sp.id = soap_charts.stylist_id
            AND sp.profile_id = auth.uid()
        )
    );
