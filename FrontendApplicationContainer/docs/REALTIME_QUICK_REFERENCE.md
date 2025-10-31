# Realtime Quick Reference

SSE is used for realtime updates.

- Endpoint: GET {REACT_APP_API_URL}/realtime/sse
- Events: job_submitted, job_progress, job_completed, job_failed, favorite_updated
- Auth: Backend-managed; frontend provides Bearer in REST, SSE relies on deployment strategy

Configure protocol via `REACT_APP_REALTIME_PROTOCOL` (sse|ws). WebSocket support is reserved for future.
