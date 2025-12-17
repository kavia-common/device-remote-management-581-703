# API Layer (Frontend)

- Base URL is taken from REACT_APP_API_BASE or REACT_APP_BACKEND_URL.
- If both are empty, the app runs in mock mode and uses local mock implementations.
- JWT (when logged in) is attached via Authorization: Bearer <token> header on real API requests.
- Health endpoint path can be customized with REACT_APP_HEALTHCHECK_PATH (default: /health).

Authentication
- Login endpoint: REACT_APP_AUTH_LOGIN_PATH (default: /auth/login)
- Refresh endpoint (optional): REACT_APP_AUTH_REFRESH_PATH (if not set, 401 triggers logout)
- On successful login, the app persists access token (and optional refresh token) in localStorage.

Switching to real backend:
1. Set REACT_APP_API_BASE (or REACT_APP_BACKEND_URL) in your environment.
2. Ensure backend exposes POST {REACT_APP_AUTH_LOGIN_PATH} returning JSON with:
   - access_token or token: string (JWT)
   - refresh_token: string (optional)
   - user: object (optional)
3. If using refresh, set REACT_APP_AUTH_REFRESH_PATH to the refresh endpoint (expects {refresh_token} in body).
4. Ensure CORS is enabled on the backend for the frontend origin.

Notes:
- Only the login flow switches to real API by default when REACT_APP_API_BASE is set. Other endpoints continue to support mock mode when API base is not set.
- Protected routes redirect unauthenticated users to /login.
