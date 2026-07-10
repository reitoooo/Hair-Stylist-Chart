-- Migration: Add target_color to user_questionnaires

ALTER TABLE user_questionnaires
ADD COLUMN target_color TEXT DEFAULT '';
