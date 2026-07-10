-- =============================================
-- Add ai_analysis to soap_charts
-- =============================================

ALTER TABLE soap_charts ADD COLUMN ai_analysis JSONB DEFAULT NULL;
