-- Example migration script (do not apply; for illustration only)
-- Use a real migrations tool in CI/CD and place scripts in this folder with incremental names.
-- Example:
--   002_add_jobs_retry_fields.sql
--   003_add_device_indexes.sql

-- BEGIN;
-- ALTER TABLE app.jobs ADD COLUMN retry_count INT NOT NULL DEFAULT 0;
-- COMMIT;
