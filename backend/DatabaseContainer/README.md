# DatabaseContainer (PostgreSQL) - Device Remote Management Platform

This container provides a PostgreSQL database and initializes the core schema for the multi-tenant Device Remote Management platform.

Directory layout (all paths relative to backend/DatabaseContainer):
- Dockerfile — Builds a Postgres 16 image with init scripts
- docker-compose.yml — Local development orchestration
- .env.example — Example environment file with required variables
- init/
  - 01_init.sql — Creates application DB, role, schema and extensions
  - 02_001_initial_schema.sql — Creates core tables and triggers
- migrations/
  - README.md — Guidance for future migrations

Quick start (local dev):
1) Copy .env.example to .env and adjust as needed.
2) Start the database:
   docker compose --env-file .env up -d
3) Health check:
   docker compose ps
   docker compose logs -f db
4) Connect with psql:
   psql "postgresql://APP_DB_USER:APP_DB_PASSWORD@localhost:POSTGRES_PORT/APP_DB_NAME"
   Example:
   psql "postgresql://drm_user:drm_password@localhost:5432/drm_app"

Seed data (development/demo)
- Export host DSN:
  export DATABASE_URL="postgresql://drm_user:drm_password@localhost:5432/drm_app"
- Apply seeds:
  psql "$DATABASE_URL" -f device-remote-management-581-703/backend/DatabaseContainer/seed/001_seed_tenant.sql
  psql "$DATABASE_URL" -f device-remote-management-581-703/backend/DatabaseContainer/seed/002_seed_admin_user.sql
  psql "$DATABASE_URL" -f device-remote-management-581-703/backend/DatabaseContainer/seed/003_seed_devices.sql
- Credentials: admin@acme.io / Admin!234

Environment variables:
- POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT
- APP_DB_NAME, APP_DB_USER, APP_DB_PASSWORD
- DATABASE_URL — Standard DSN for backend services (do not hardcode in code)

Standard DATABASE_URL format:
postgresql://USER:PASSWORD@HOST:PORT/DBNAME
Examples:
- Local host access: postgresql://drm_user:drm_password@localhost:5432/drm_app
- Inside compose network (service name "db"): postgresql://drm_user:drm_password@db:5432/drm_app

Backend integration:
- Backend services should read DATABASE_URL from environment (e.g., using a .env file or orchestration).
- Do not store credentials in source code.
- Default schema is "app"; search_path is configured to "app, public" for APP_DB_USER.

Initialization and migrations:
- Files in init/ run once on the first initialization of the database volume (mounted to /docker-entrypoint-initdb.d).
- After initial bootstrap, manage schema changes with a migration tool (Flyway, Sqitch, Prisma, etc.) and place SQL scripts under migrations/.
- See migrations/README.md for recommendations.

Core schema (multi-tenant):
- tenants — Organizations (id, name, slug)
- users — Users scoped by tenant; unique (tenant_id, email)
- devices — Managed devices; unique (tenant_id, identifier)
- device_credentials — Per-device, per-protocol credentials; unique (tenant_id, device_id, protocol)
- jobs — Async protocol jobs with status, parameters, results
- job_events — Timeline events tied to jobs
- protocol_results — Flattened results for queryability
- refresh_tokens — Auth refresh tokens with expiry and revoke fields
- audit_logs — Activity audit trail
- mib_store — MIB modules storage (raw text + metadata)
- tr181_params — TR-181 parameter catalog and metadata

Networking:
- Default port: 5432 (configurable via POSTGRES_PORT).
- Exposed to host via docker-compose for local development.

Security notes:
- Use strong passwords for POSTGRES_PASSWORD and APP_DB_PASSWORD in non-dev environments.
- Restrict host port exposure in production or run behind a private network.
- Grant application only required privileges; superuser is not used by the app.

Troubleshooting:
- If init scripts did not run, remove the persistent volume and start again:
  docker compose down -v
  docker compose up -d
- Verify the schema exists:
  psql "$DATABASE_URL" -c '\dn'
- Verify tables:
  psql "$DATABASE_URL" -c '\dt app.*'
