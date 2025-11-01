-- Seed: Default admin user for tenant 'acme'
-- Uses a bcrypt password hash. DO NOT commit real/production passwords.
-- Default credentials (for local/dev): admin@acme.io / Admin!234
-- Bcrypt hash below corresponds to 'Admin!234' cost=12

SET search_path TO app, public;

WITH t AS (
  SELECT id AS tenant_id
  FROM tenants
  WHERE slug = 'acme'
)
INSERT INTO users (tenant_id, email, password_hash, name, roles, is_active)
SELECT
  t.tenant_id,
  'admin@acme.io',
  -- bcrypt hash for 'Admin!234' (12 rounds). Change in non-dev.
  '$2b$12$9Uu0jYqjs9Zk9xXkH1R5GOhc4gS/2bWZ8K7qH5C3Zxg0dBAE4Soky',
  'Acme Administrator',
  ARRAY['admin','user']::text[],
  TRUE
FROM t
ON CONFLICT (tenant_id, email) DO NOTHING;
