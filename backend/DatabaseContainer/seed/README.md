# Seed Scripts

This folder contains SQL seed scripts to populate a development/demo dataset for the Device Remote Management platform. These scripts are idempotent and safe to re-run; they rely on unique constraints to avoid duplicates.

What gets seeded:
- A default tenant: Acme Corp (slug: `acme`)
- An admin user for the tenant (`admin@acme.io`) with a securely hashed bcrypt password
- A couple of sample devices under the tenant

Files:
- 001_seed_tenant.sql — Inserts the default tenant
- 002_seed_admin_user.sql — Inserts the admin user with roles `admin,user`
- 003_seed_devices.sql — Inserts two example devices

Prerequisites:
- The database schema must be initialized (tables created in schema `app`). If you used the provided DatabaseContainer, starting it once runs `init/` scripts to create schema.
- Have `psql` installed locally.
- Set the standard connection string as `DATABASE_URL`.

Example DATABASE_URL formats:
- Local host access: `postgresql://drm_user:drm_password@localhost:5432/drm_app`
- Inside docker compose network (service name `db`): `postgresql://drm_user:drm_password@db:5432/drm_app`

How to run:
1) Ensure the database is running and schema is initialized.
2) Export your connection string:
   export DATABASE_URL="postgresql://drm_user:drm_password@localhost:5432/drm_app"
3) Apply the seeds in order:
   psql "$DATABASE_URL" -f device-remote-management-581-703/backend/DatabaseContainer/seed/001_seed_tenant.sql
   psql "$DATABASE_URL" -f device-remote-management-581-703/backend/DatabaseContainer/seed/002_seed_admin_user.sql
   psql "$DATABASE_URL" -f device-remote-management-581-703/backend/DatabaseContainer/seed/003_seed_devices.sql

Notes on password hashing:
- The admin user password is stored as a bcrypt hash with cost 12. The current hash corresponds to the development password: `Admin!234`.
- Replace this with your own hash for non-development environments.
- Never commit real production passwords. Always commit only hashes intended for development/demo.

Troubleshooting:
- If you see relation does not exist errors, make sure the `app` schema and tables are created by running the DatabaseContainer init scripts.
- Verify tables exist:
  psql "$DATABASE_URL" -c '\dt app.*'
- Re-run a specific seed file any time; constraints keep it idempotent.
