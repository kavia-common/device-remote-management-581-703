import app from './app';
import { env } from './config/env';

/**
 * PUBLIC_INTERFACE
 * Starts the HTTP server listening on configured port.
 */
export function startServer() {
  /** Binds Express app to PORT and logs startup details. */
  const server = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on port ${env.PORT} at base ${env.API_BASE_PATH}. Swagger UI: http://localhost:${env.PORT}/docs`);
  });
  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
