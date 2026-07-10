-- Migration to add has_bleach column to questionnaires table

ALTER TABLE questionnaires
ADD COLUMN has_bleach TEXT DEFAULT 'no';
