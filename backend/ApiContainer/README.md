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
- PORT (default 8080)
- API_BASE_PATH (default /api/v1)
- DATABASE_URL (required for DB usage; not used in stubs)
- REDIS_URL (optional)
- JWT_SECRET (default "change_me_in_prod")
- CORS_ORIGIN (comma-separated origins, or * to allow all)

Scripts:
- npm run dev — start in watch mode with tsx (dev)
- npm run build — compile TypeScript to dist
- npm start — run compiled server

Local development:
1) npm install
2) npm run dev
   API at http://localhost:8080/api/v1
   Docs at http://localhost:8080/docs

Notes:
- Auth/login is a stub; integrate with DatabaseContainer to validate credentials and issue real JWTs.
- Jobs and protocol endpoints are placeholders to satisfy frontend integration. Replace with real implementations.
