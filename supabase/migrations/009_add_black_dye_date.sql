-- Migration to add black_dye_date column to questionnaires table

ALTER TABLE questionnaires
ADD COLUMN black_dye_date TEXT DEFAULT '';
