-- Seed: Sample devices for tenant 'acme'
-- Two sample devices to help with local development and demos.

SET search_path TO app, public;

WITH t AS (
  SELECT id AS tenant_id
  FROM tenants
  WHERE slug = 'acme'
),
ins AS (
  INSERT INTO devices (tenant_id, name, identifier, mgmt_address, tags)
  SELECT t.tenant_id, 'Edge Router', 'ER-1001', '192.168.10.1', ARRAY['router','edge']::text[]
  FROM t
  ON CONFLICT (tenant_id, identifier) DO NOTHING
  RETURNING 1
)
-- second insert separate to ensure both attempt even if first conflicts
INSERT INTO devices (tenant_id, name, identifier, mgmt_address, tags)
SELECT t.tenant_id, 'Core Switch', 'CS-5001', '192.168.20.10', ARRAY['switch','core']::text[]
FROM t
ON CONFLICT (tenant_id, identifier) DO NOTHING;
