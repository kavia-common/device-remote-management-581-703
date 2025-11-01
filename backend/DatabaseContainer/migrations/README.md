This folder is reserved for future SQL migrations (applied after initial bootstrap).

Recommended approaches:
- Use a migrations tool like Flyway, Sqitch, or Prisma Migrate.
- Maintain files with an incremental naming convention, e.g.:
  002_add_indexes.sql
  003_add_job_retry_fields.sql

Note: The initial bootstrap schema is created by init/02_001_initial_schema.sql on first run only.

Applying ad-hoc SQL in local development:
- Ensure DATABASE_URL is set (see ../.env.example).
- Example:
  export DATABASE_URL="postgresql://drm_user:drm_password@localhost:5432/drm_app"
  psql "$DATABASE_URL" -f migrations/002_add_indexes.sql

Flyway example (conceptual):
- Place SQL files here and configure flyway with:
  flyway -url="$DATABASE_URL" -user="$APP_DB_USER" -password="$APP_DB_PASSWORD" migrate
