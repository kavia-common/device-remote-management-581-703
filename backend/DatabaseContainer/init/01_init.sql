-- Initializes application database and role on first container startup.

\echo '===> Running 01_init.sql to create application DB and user'

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles WHERE rolname = current_setting('APP_DB_USER', true)
  ) THEN
    EXECUTE format('CREATE ROLE %I WITH LOGIN PASSWORD %L',
      current_setting('APP_DB_USER', true),
      current_setting('APP_DB_PASSWORD', true)
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_database WHERE datname = current_setting('APP_DB_NAME', true)
  ) THEN
    EXECUTE format('CREATE DATABASE %I OWNER %I',
      current_setting('APP_DB_NAME', true),
      current_setting('APP_DB_USER', true)
    );
  END IF;
END$$;

-- Ensure extensions for UUIDs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname='uuid-ossp'
  ) THEN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  END IF;
END$$;

\echo '===> Application database and user ensured'

-- Connect to application database and set defaults
\connect :APP_DB_NAME

-- Set extension in app DB as well
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Basic schema namespacing for app
CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION :APP_DB_USER;

ALTER ROLE :APP_DB_USER IN DATABASE :APP_DB_NAME SET search_path = app, public;

GRANT ALL ON SCHEMA app TO :APP_DB_USER;

\echo '===> Base schemas created'
