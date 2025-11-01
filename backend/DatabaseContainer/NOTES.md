Local development notes:

- Start database:
  docker compose up -d

- Connect with psql:
  psql "postgresql://POSTGRES_USER:POSTGRES_PASSWORD@localhost:POSTGRES_PORT/APP_DB_NAME"
  Example:
  psql "postgresql://postgres:postgres@localhost:5432/drm_app"

- Environment variables:
  Use .env or your orchestrator to provide POSTGRES_* and APP_DB_* variables.

- Schema location:
  init/01_init.sql creates app DB and role
  init/02_001_initial_schema.sql creates tables/indexes in schema 'app'
