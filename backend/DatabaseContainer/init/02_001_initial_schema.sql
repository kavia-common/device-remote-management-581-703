-- Initial Schema for Device Remote Management (multi-tenant)
-- This file runs at first initialization and creates core tables.

\echo '===> Running 02_001_initial_schema.sql initial schema'

SET search_path TO app, public;

-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email CITEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  roles TEXT[] NOT NULL DEFAULT ARRAY['user']::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);

-- Devices
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  identifier TEXT NOT NULL, -- could be MAC, serial, hostname
  mgmt_address INET,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, identifier)
);

-- Device Credentials (per protocol)
CREATE TYPE protocol_type AS ENUM ('snmp', 'webpa', 'tr69', 'tr369');

CREATE TABLE IF NOT EXISTS device_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  protocol protocol_type NOT NULL,
  data JSONB NOT NULL, -- encrypted/encoded secrets should be handled app-side
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, device_id, protocol)
);

-- Jobs (async operations)
CREATE TYPE job_status AS ENUM ('queued', 'running', 'completed', 'failed', 'cancelled');

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  protocol protocol_type NOT NULL,
  action TEXT NOT NULL, -- e.g., 'snmp.get', 'tr69.getParameterValues'
  parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  status job_status NOT NULL DEFAULT 'queued',
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_tenant_status ON jobs (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_protocol ON jobs (protocol);

-- Job Events (status timeline)
CREATE TABLE IF NOT EXISTS job_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- e.g., 'queued','started','progress','completed','failed'
  message TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_events_job ON job_events (job_id, created_at);

-- Protocol Results (normalized table for querying result sets)
CREATE TABLE IF NOT EXISTS protocol_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  key TEXT,         -- e.g., OID or parameter path
  value TEXT,       -- store as text for CSV-friendly search; raw in jobs.result
  meta JSONB,       -- extra meta like type, units, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_protocol_results_job ON protocol_results (job_id);
CREATE INDEX IF NOT EXISTS idx_protocol_results_key ON protocol_results (key);

-- Refresh Tokens (auth)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  UNIQUE (user_id, token_hash)
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- e.g., 'login','device.create','job.run'
  target_type TEXT,
  target_id TEXT,
  metadata JSONB,
  ip INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_time ON audit_logs (tenant_id, created_at);

-- MIB Store (uploaded or parsed MIBs)
CREATE TABLE IF NOT EXISTS mib_store (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL, -- optional tenant-bound MIBs
  module_name TEXT NOT NULL,
  version TEXT,
  source TEXT, -- filename or origin
  content TEXT, -- raw MIB text
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, module_name, version)
);

-- TR-181 Parameter Catalog (metadata repository)
CREATE TABLE IF NOT EXISTS tr181_params (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL, -- optional tenant-specific overrides
  parameter TEXT NOT NULL, -- e.g., 'Device.DeviceInfo.SerialNumber'
  datatype TEXT,           -- e.g., 'string','int'
  writable BOOLEAN DEFAULT FALSE,
  description TEXT,
  default_value TEXT,
  constraints JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, parameter)
);

-- Triggers to update updated_at
CREATE OR REPLACE FUNCTION app_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'app'
      AND tablename IN ('tenants','users','devices','device_credentials','jobs','tr181_params')
  LOOP
    EXECUTE format('
      DO $do$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger
          WHERE tgname = %L
        ) THEN
          CREATE TRIGGER %I
          BEFORE UPDATE ON app.%I
          FOR EACH ROW
          EXECUTE FUNCTION app_set_updated_at();
        END IF;
      END
      $do$;', r.tablename || '_set_updated_at', r.tablename || '_set_updated_at', r.tablename);
  END LOOP;
END$$;

\echo '===> Initial schema created'
