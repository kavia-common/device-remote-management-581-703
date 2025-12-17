# API Layer (Frontend)

- Base URL is taken from REACT_APP_API_BASE or REACT_APP_BACKEND_URL.
- If both are empty, the app runs in mock mode and uses local mock implementations.
- JWT (when logged in) is attached via Authorization: Bearer <token> header on real API requests.
- Health endpoint path can be customized with REACT_APP_HEALTHCHECK_PATH (default: /health).

Switching to real backend:
1. Set REACT_APP_API_BASE (or REACT_APP_BACKEND_URL) in your environment.
2. Replace mocked login in pages/Login.jsx to call apiLogin() from src/api/index.js.
3. Ensure CORS is enabled on the backend for the frontend origin.
