ALTER TABLE ct_users ADD COLUMN IF NOT EXISTS roles text[] DEFAULT '{}';
UPDATE ct_users SET roles = ARRAY[role] WHERE roles = '{}' OR roles IS NULL;
