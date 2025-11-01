-- Migration 002: Additional indexes and constraints for performance and integrity.

SET search_path TO app, public;

-- Tenant scoping and common lookups
CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users (tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_devices_tenant_identifier ON devices (tenant_id, identifier);
CREATE INDEX IF NOT EXISTS idx_devices_tenant_name ON devices (tenant_id, name);

-- Credentials lookups
CREATE INDEX IF NOT EXISTS idx_device_credentials_tenant_device_protocol ON device_credentials (tenant_id, device_id, protocol);

-- Jobs filtering
CREATE INDEX IF NOT EXISTS idx_jobs_tenant_status ON jobs (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_protocol ON jobs (protocol);
CREATE INDEX IF NOT EXISTS idx_jobs_tenant_created_at ON jobs (tenant_id, created_at DESC);

-- Job events timeline
CREATE INDEX IF NOT EXISTS idx_job_events_job ON job_events (job_id, created_at);

-- Protocol results exploration
CREATE INDEX IF NOT EXISTS idx_protocol_results_job ON protocol_results (job_id);
CREATE INDEX IF NOT EXISTS idx_protocol_results_key ON protocol_results (key);
CREATE INDEX IF NOT EXISTS idx_protocol_results_device ON protocol_results (device_id);

-- Audit by tenant/time
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_time ON audit_logs (tenant_id, created_at DESC);

-- TR-181 params access
CREATE INDEX IF NOT EXISTS idx_tr181_params_tenant_parameter ON tr181_params (tenant_id, parameter);

-- Additional referential integrity notes:
-- All foreign keys already use ON DELETE CASCADE where tenant scoped, and SET NULL where historical preservation makes sense.
