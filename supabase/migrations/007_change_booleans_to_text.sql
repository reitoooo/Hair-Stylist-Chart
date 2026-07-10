-- Migration: Change history booleans to text to support 'unknown' state

ALTER TABLE user_questionnaires 
ALTER COLUMN has_black_dye TYPE TEXT USING (CASE WHEN has_black_dye THEN 'yes' ELSE 'no' END),
ALTER COLUMN has_straightening TYPE TEXT USING (CASE WHEN has_straightening THEN 'yes' ELSE 'no' END),
ALTER COLUMN has_perm TYPE TEXT USING (CASE WHEN has_perm THEN 'yes' ELSE 'no' END);

ALTER TABLE user_questionnaires 
ALTER COLUMN has_black_dye SET DEFAULT 'no',
ALTER COLUMN has_straightening SET DEFAULT 'no',
ALTER COLUMN has_perm SET DEFAULT 'no';
