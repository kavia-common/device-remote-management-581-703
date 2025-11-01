# TypeScript Migration Notes

This CRA app has been migrated to TypeScript.

Key points:
- Entry now uses src/index.tsx and src/App.tsx
- Routing with react-router-dom v6 (see src/router/index.tsx)
- State with Redux Toolkit (src/store)
- React Query provider in index.tsx
- Axios client with JWT interceptors (src/api/httpClient.ts)
- Public/protected routes via ProtectedRoute

Install deps:
- npm install

Environment:
- REACT_APP_API_BASE_URL (optional) defaults to http://localhost:8080/api/v1
