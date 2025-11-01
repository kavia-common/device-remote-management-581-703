import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { errorHandler } from './middleware/error';
import { authMiddleware } from './middleware/auth';
import { tenantMiddleware } from './middleware/tenant';
import openapi from './openapi.json' assert { type: 'json' };

const app = express();

// Basic security and parsing
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all in dev if CORS_ORIGIN unset
      if (!env.CORS_ORIGIN || env.CORS_ORIGIN === '*') return callback(null, true);
      // Support comma-separated list
      const allowed = env.CORS_ORIGIN.split(',').map((s) => s.trim());
      if (!origin || allowed.includes(origin)) return callback(null, true);
      return callback(new Error('CORS not allowed'), false);
    },
    credentials: true
  })
);

// API base router
const api = express.Router();

// Health endpoint
/**
 * PUBLIC_INTERFACE
 * GET /health - Health check endpoint.
 */
api.get('/health', (req: Request, res: Response) => {
  /** Returns liveness info and configured integrations presence flags. */
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    databaseConfigured: Boolean(env.DATABASE_URL),
    redisConfigured: Boolean(env.REDIS_URL)
  });
});

// Auth routes (stub login returns demo tokens)
api.post(
  '/auth/login',
  async (req: Request, res: Response) => {
    /**
     * Login endpoint (stub).
     * Accepts email/password and returns demo JWTs. Replace with real verification later.
     */
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Email is required', timestamp: new Date().toISOString(), path: req.originalUrl } });
    }
    // In real implementation: validate credentials against DB and sign tokens with user/tenant info
    const accessToken = 'demo_access_token';
    const refreshToken = 'demo_refresh_token';
    return res.json({
      accessToken,
      refreshToken,
      user: { id: '1', email, name: 'Demo User', roles: ['user'] }
    });
  }
);

// Protected route examples
api.use(authMiddleware);
api.use(tenantMiddleware);

// Placeholder jobs endpoints to support frontend polling
api.get('/jobs', async (_req: Request, res: Response) => {
  /**
   * Returns a placeholder list of jobs.
   * Replace with DB-backed job retrieval.
   */
  return res.json([
    { id: 'job-1', status: 'completed', result: { message: 'Sample result' } },
    { id: 'job-2', status: 'running' }
  ]);
});

api.get('/jobs/:id', async (req: Request, res: Response) => {
  /** Returns a placeholder single job. */
  const { id } = req.params;
  return res.json({ id, status: 'running' });
});

// Protocol placeholder endpoints to accept form submissions and return job id
api.post('/protocols/snmp', async (_req: Request, res: Response) => {
  /** Accepts SNMP operation request; returns a queued job id (stub). */
  return res.status(202).json({ jobId: 'snmp-' + Date.now() });
});

api.post('/protocols/webpa', async (_req: Request, res: Response) => {
  /** Accepts WebPA operation request; returns a queued job id (stub). */
  return res.status(202).json({ jobId: 'webpa-' + Date.now() });
});

api.post('/protocols/tr69', async (_req: Request, res: Response) => {
  /** Accepts TR69 operation request; returns a queued job id (stub). */
  return res.status(202).json({ jobId: 'tr69-' + Date.now() });
});

api.post('/protocols/tr369', async (_req: Request, res: Response) => {
  /** Accepts TR369 operation request; returns a queued job id (stub). */
  return res.status(202).json({ jobId: 'tr369-' + Date.now() });
});

// Mount base path
app.use(env.API_BASE_PATH, api);

// Swagger UI at /docs serving openapi.json
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi, { explorer: true }));

// 404 handler for API
app.use((req: Request, res: Response) => {
  if (req.originalUrl.startsWith(env.API_BASE_PATH)) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      }
    });
  }
  return res.status(404).send('Not Found');
});

// Error handler
app.use(errorHandler);

export default app;
