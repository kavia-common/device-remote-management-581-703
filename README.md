# device-remote-management-581-703

Development quick start and environment wiring for the multi-container device management platform.

Components
- FrontendApplicationContainer (React/TypeScript) — runs at http://localhost:3000
- backend/ApiContainer (Node/TypeScript) — serves API at http://localhost:8080/api/v1 with CORS
- backend/DatabaseContainer (PostgreSQL) — provides schema, migrations, and seed SQL
- Redis (optional/local) — for background workers (stubbed)

Environment
- Frontend: REACT_APP_API_BASE_URL must point to http://localhost:8080/api/v1
- Backend: CORS_ORIGIN must include http://localhost:3000 and API_BASE_PATH=/api/v1
- Database: DATABASE_URL should be exported for running migrations/seeds

1) Frontend setup
- cd device-remote-management-581-703/FrontendApplicationContainer
- Copy .env.example to .env (or .env.development.local)
  REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
- npm install
- npm start
The app will be available at http://localhost:3000

2) Backend API setup
- cd device-remote-management-581-703/backend/ApiContainer
- Copy .env.example to .env and set:
  PORT=8080
  API_BASE_PATH=/api/v1
  CORS_ORIGIN=http://localhost:3000
  JWT_SECRET=change_me_in_dev
  DATABASE_URL=postgresql://drm_user:drm_password@localhost:5432/drm_app
- npm install
- npm run dev
API available at http://localhost:8080/api/v1
Swagger docs at http://localhost:8080/docs

3) Database setup, migrations, and seed
- cd device-remote-management-581-703/backend/DatabaseContainer
- Copy .env.example to .env and adjust values if needed
- Start Postgres locally via compose:
  docker compose --env-file .env up -d
- Verify service:
  docker compose ps
  docker compose logs -f db
- Ensure DATABASE_URL is exported in your shell (host DSN):
  export DATABASE_URL="postgresql://drm_user:drm_password@localhost:5432/drm_app"

Apply (or re-apply) initialization and seed data:
The container bootstraps schema automatically on first run via init/. For development/demo accounts and devices, run the seed scripts:

  psql "$DATABASE_URL" -f device-remote-management-581-703/backend/DatabaseContainer/seed/001_seed_tenant.sql
  psql "$DATABASE_URL" -f device-remote-management-581-703/backend/DatabaseContainer/seed/002_seed_admin_user.sql
  psql "$DATABASE_URL" -f device-remote-management-581-703/backend/DatabaseContainer/seed/003_seed_devices.sql

Seeded login:
- Email: admin@acme.io
- Password: Admin!234

4) docker-compose alignment (optional one-shot local stack)
A simple composition can be used by ensuring the following environment settings:
- Frontend: REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
- Backend: PORT=8080, API_BASE_PATH=/api/v1, CORS_ORIGIN=http://localhost:3000, DATABASE_URL=postgresql://drm_user:drm_password@db:5432/drm_app
- Database: Expose 5432 and default APP_DB_* from .env.example

5) End-to-end verification steps
- Start Database (section 3) and run seed scripts
- Start Backend API (section 2)
- Start Frontend (section 1)

In the frontend:
1. Login using:
   - Email: admin@acme.io
   - Password: Admin!234
2. Navigate to Devices → List: verify the two seeded devices appear.
3. Create an SNMP GET job:
   - Go to Protocols → SNMP
   - Enter target device identifier or select from list, provide OID (e.g., 1.3.6.1.2.1.1.1.0) and community for v2c (public)
   - Submit job
4. Poll job status:
   - Go to Jobs → Jobs List
   - Confirm the job appears with status transitioning (queued → processing → completed/failed)
   - Open job details to view results when completed

Troubleshooting
- CORS: If the browser blocks requests, ensure backend CORS_ORIGIN includes http://localhost:3000 and that the API is reachable.
- Auth: Ensure JWT_SECRET is set. In development, the auth route is stubbed but should accept the seeded admin for login if wired.
- Database: If init scripts didn’t run, remove volume and re-up: docker compose down -v && docker compose up -d. Verify tables: psql "$DATABASE_URL" -c '\dt app.*'

Notes
- Do not commit real secrets; use .env files and environment variables.
- In production, set strong passwords and tighten CORS.