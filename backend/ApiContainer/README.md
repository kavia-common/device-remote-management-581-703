# Backend ApiContainer (Node.js/TypeScript)

Express-based API server exposing /api/v1 with CORS, JWT middleware, and Swagger UI at /docs.

Features:
- TypeScript, Express, Helmet, CORS, Morgan
- Base path: /api/v1, port 8080 (configurable via env)
- Middleware: auth (JWT), tenant, centralized error handler
- Utils: JWT signing/verification, pagination helper
- OpenAPI served via Swagger UI at /docs
- Environment-driven config (DATABASE_URL, REDIS_URL, JWT_SECRET, CORS_ORIGIN)
- Dockerfile ready for containerization

Environment variables (create a .env next to this folder or set via orchestrator):
- PORT=8080
- API_BASE_PATH=/api/v1
- DATABASE_URL=postgresql://drm_user:drm_password@localhost:5432/drm_app
- REDIS_URL=redis://localhost:6379 (optional)
- JWT_SECRET=change_me_in_dev
- CORS_ORIGIN=http://localhost:3000

Scripts:
- npm run dev — start in watch mode with tsx (dev)
- npm run build — compile TypeScript to dist
- npm start — run compiled server

Local development:
1) npm install
2) Create .env from .env.example and set values (see above)
3) npm run dev
   API at http://localhost:8080/api/v1
   Docs at http://localhost:8080/docs

CORS
- Ensure CORS_ORIGIN includes the frontend origin (http://localhost:3000) to allow browser requests.
- Multiple origins can be provided as a comma-separated list.

Database and Seeds
- Start the PostgreSQL DatabaseContainer and ensure DATABASE_URL points to your instance.
- See backend/DatabaseContainer/README.md for details.
- Seed demo data (tenant, admin user, devices):
  export DATABASE_URL="postgresql://drm_user:drm_password@localhost:5432/drm_app"
  psql "$DATABASE_URL" -f ../../backend/DatabaseContainer/seed/001_seed_tenant.sql
  psql "$DATABASE_URL" -f ../../backend/DatabaseContainer/seed/002_seed_admin_user.sql
  psql "$DATABASE_URL" -f ../../backend/DatabaseContainer/seed/003_seed_devices.sql

End-to-end smoke test
- Frontend: set REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
- Backend: set CORS_ORIGIN=http://localhost:3000
- Login with admin@acme.io / Admin!234
- Devices list should include two seeded devices
- Create SNMP GET job and watch status in Jobs page

Notes:
- Auth/login is a stub; integrate with DatabaseContainer to validate credentials and issue real JWTs.
- Jobs and protocol endpoints are placeholders to satisfy frontend integration. Replace with real implementations.
