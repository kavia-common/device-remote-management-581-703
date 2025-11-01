-- Migration 003: Protocol support helper structures (extensibility placeholders).
-- These tables are optional helpers that can be used by worker services for caching metadata.

SET search_path TO app, public;

-- SNMP OID metadata cache (derived from MIBs)
CREATE TABLE IF NOT EXISTS snmp_oid_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  oid TEXT NOT NULL,                   -- e.g., 1.3.6.1.2.1.1.1.0
  name TEXT,                           -- e.g., sysDescr
  syntax TEXT,                         -- textual syntax type
  description TEXT,
  module_name TEXT,                    -- MIB module
  access TEXT,                         -- read-only, read-write, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, oid)
);

CREATE INDEX IF NOT EXISTS idx_snmp_oid_catalog_tenant_oid ON snmp_oid_catalog (tenant_id, oid);
CREATE INDEX IF NOT EXISTS idx_snmp_oid_catalog_module ON snmp_oid_catalog (module_name);

-- TR-69 RPC method catalog (useful for validation and UI hints)
CREATE TABLE IF NOT EXISTS tr69_rpc_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  method TEXT NOT NULL,                -- e.g., GetParameterValues
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (method)
);

-- TR-369/USP object model fragments cache (to accelerate UI browsing)
CREATE TABLE IF NOT EXISTS tr369_object_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  path TEXT NOT NULL,                  -- e.g., Device.LocalAgent.Controller.
  description TEXT,
  writable BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, path)
);

CREATE INDEX IF NOT EXISTS idx_tr369_object_catalog_tenant_path ON tr369_object_catalog (tenant_id, path);
```

Explanation: Add seed scaffold readme to guide future seeding
````write file="device-remote-management-581-703/backend/DatabaseContainer/seed/README.md"
# Seed Data Scaffold

This folder is reserved for seed scripts used during development or demos. Keep production data out of source control.

Suggested approach:
- Create SQL files prefixed with numbers for deterministic execution, for example:
  - 001_seed_tenants.sql
  - 002_seed_users.sql
  - 003_seed_devices.sql
- Apply them manually using:
  export DATABASE_URL="postgresql://drm_user:drm_password@localhost:5432/drm_app"
  psql "$DATABASE_URL" -f seed/001_seed_tenants.sql
  psql "$DATABASE_URL" -f seed/002_seed_users.sql
  psql "$DATABASE_URL" -f seed/003_seed_devices.sql

Guidelines:
- Use UUID defaults (uuid_generate_v4()) where applicable.
- Use timestamptz (TIMESTAMPTZ) for time fields.
- Use JSONB for structured blobs such as credentials and results.
- Respect multi-tenant scoping: include tenant_id where relevant.
- Reference existing tables and honor foreign keys (use ON DELETE CASCADE where defined).
- Avoid leaking secrets. Use development-only data.

Example minimal tenant seed (001_seed_tenants.sql):
  SET search_path TO app, public;
  INSERT INTO tenants (name, slug) VALUES ('Acme Corp', 'acme')
  ON CONFLICT (name) DO NOTHING;

Example minimal user seed (002_seed_users.sql):
  SET search_path TO app, public;
  WITH t AS (
    SELECT id AS tenant_id FROM tenants WHERE slug = 'acme'
  )
  INSERT INTO users (tenant_id, email, password_hash, name, roles)
  SELECT t.tenant_id, 'admin@acme.io', '$2b$12$replace_with_hash', 'Admin', ARRAY['admin']::text[]
  FROM t
  ON CONFLICT DO NOTHING;

Note:
- Password hashes must be pre-computed (e.g., bcrypt). Do not commit plaintext passwords.
