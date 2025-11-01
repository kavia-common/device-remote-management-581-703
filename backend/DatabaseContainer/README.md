# DatabaseContainer (PostgreSQL) - Device Remote Management Platform

This container provides a PostgreSQL database and initializes the core schema for the multi-tenant Device Remote Management platform.

Contents:
- Dockerfile: Builds a Postgres image with init scripts
- docker-compose.yml: Local development orchestration (optional usage)
- init/01_init.sql: Database, roles, schemas
- migrations/001_initial_schema.sql: Tables and indexes for:
  tenants, users, devices, device_credentials, jobs, job_events, protocol_results, refresh_tokens, audit_logs, mib_store, tr181_params

Quick start (local dev):
1) Ensure environment variables (see .env.example) are set in your orchestrator
2) docker compose up -d

Security and configuration:
- Do not hardcode secrets. Use environment variables:
  POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT, APP_DB_NAME, APP_DB_USER, APP_DB_PASSWORD
- The init scripts will create the application database/user distinct from the superuser.

Migrations:
- The init directory runs only on first database initialization (mounted to /docker-entrypoint-initdb.d).
- After first start, apply schema changes via a migrations tool (e.g., sqitch, flyway, or Prisma). A basic SQL migration is included to bootstrap.

Schema overview (multi-tenant):
- tenants: Organizations
- users: Platform users with tenant scoping
- devices: Managed devices scoped to tenants
- device_credentials: Protocol creds per device
- jobs: Asynchronous operations (protocol jobs)
- job_events: Per-job event logs and status updates
- protocol_results: Results of protocol executions
- refresh_tokens: Auth refresh tokens
- audit_logs: System activity audit trail
- mib_store: Uploaded or parsed MIB modules contents/metadata
- tr181_params: TR-181 parameter metadata

Networking:
- Default port: 5432 (configurable via POSTGRES_PORT)
- Exposed only within docker-compose unless otherwise configured
