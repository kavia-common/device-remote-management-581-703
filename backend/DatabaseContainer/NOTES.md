Local development notes:

- Start database:
  docker compose --env-file .env up -d

- Connect with psql:
  # Using application user/DB
  psql "postgresql://APP_DB_USER:APP_DB_PASSWORD@localhost:POSTGRES_PORT/APP_DB_NAME"
  Example:
  psql "postgresql://drm_user:drm_password@localhost:5432/drm_app"

- Environment variables:
  Use .env or your orchestrator to provide POSTGRES_* and APP_DB_* variables.
  Backend services should use DATABASE_URL:
  postgresql://drm_user:drm_password@localhost:5432/drm_app
  Inside compose network, host is "db":
  postgresql://drm_user:drm_password@db:5432/drm_app

- Schema location:
  init/01_init.sql creates app DB and role
  init/02_001_initial_schema.sql creates tables/indexes in schema 'app'
