import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { errorHandler } from './middleware/error';
import { authMiddleware } from './middleware/auth';
import { tenantMiddleware } from './middleware/tenant';
import { getPagination } from './utils/pagination';
import { signAccessToken, signRefreshToken, verifyToken } from './utils/jwt';
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

// In-memory placeholder store to simulate persistence if DATABASE_URL not wired.
// In a real implementation, replace with Prisma/knex/pg queries using env.DATABASE_URL.
const mem = {
  users: [
    { id: '1', email: 'admin@acme.io', name: 'Acme Administrator', roles: ['admin', 'user'], tenantId: 't-1' },
    { id: '2', email: 'demo@acme.io', name: 'Demo User', roles: ['user'], tenantId: 't-1' }
  ],
  devices: [
    { id: 'd-1', tenantId: 't-1', name: 'Edge Router', identifier: 'ER-1001', mgmt_address: '192.168.10.1', tags: ['router','edge'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'd-2', tenantId: 't-1', name: 'Core Switch', identifier: 'CS-5001', mgmt_address: '192.168.20.10', tags: ['switch','core'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  jobs: [
    { id: 'job-1', tenantId: 't-1', status: 'completed', result: { message: 'Sample result' } },
    { id: 'job-2', tenantId: 't-1', status: 'running' }
  ],
  refreshTokens: new Map<string, { userId: string; token: string; expiresAt: number }>()
};

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

// ====================== AUTH ======================

/**
 * PUBLIC_INTERFACE
 * POST /auth/login - Issues access/refresh tokens (placeholder validation).
 */
api.post('/auth/login', async (req: Request, res: Response) => {
  /**
   * Login endpoint.
   * Accepts email/password and returns JWTs. Replace with real DB verification later.
   */
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({
      error: { code: 'BAD_REQUEST', message: 'Email and password are required', timestamp: new Date().toISOString(), path: req.originalUrl }
    });
  }

  // Pretend to look up user by email; in DB-backed version, verify password hash etc.
  const user = mem.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) {
    return res.status(401).json({
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', timestamp: new Date().toISOString(), path: req.originalUrl }
    });
  }

  const payload = { sub: user.id, email: user.email, roles: user.roles, tenantId: user.tenantId };
  const accessToken = signAccessToken(payload, '30m');
  const refreshToken = signRefreshToken({ sub: user.id, tenantId: user.tenantId }, '7d');

  // Track refresh in memory for demo
  mem.refreshTokens.set(refreshToken, { userId: user.id, token: refreshToken, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });

  return res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name, roles: user.roles }
  });
});

/**
 * PUBLIC_INTERFACE
 * POST /auth/refresh - Exchanges a valid refresh token for a new access token.
 */
api.post('/auth/refresh', async (req: Request, res: Response) => {
  /**
   * Accepts refreshToken in body, verifies it and issues a new short-lived access token.
   */
  const { refreshToken } = req.body || {};
  if (!refreshToken) {
    return res.status(400).json({
      error: { code: 'BAD_REQUEST', message: 'refreshToken is required', timestamp: new Date().toISOString(), path: req.originalUrl }
    });
  }
  try {
    const decoded = verifyToken<{ sub?: string; tenantId?: string }>(refreshToken);
    const stored = mem.refreshTokens.get(refreshToken);
    if (!stored || stored.userId !== decoded.sub) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token', timestamp: new Date().toISOString(), path: req.originalUrl }
      });
    }
    const user = mem.users.find((u) => u.id === decoded.sub);
    if (!user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Unknown user', timestamp: new Date().toISOString(), path: req.originalUrl }
      });
    }
    const newAccess = signAccessToken({ sub: user.id, email: user.email, roles: user.roles, tenantId: user.tenantId }, '30m');
    return res.json({ accessToken: newAccess });
  } catch {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token', timestamp: new Date().toISOString(), path: req.originalUrl }
    });
  }
});

/**
 * PUBLIC_INTERFACE
 * POST /auth/logout - Revokes a refresh token (if provided).
 */
api.post('/auth/logout', async (req: Request, res: Response) => {
  /**
   * Accepts refreshToken in body to revoke, best-effort no-op if not found.
   */
  const { refreshToken } = req.body || {};
  if (refreshToken) {
    mem.refreshTokens.delete(refreshToken);
  }
  return res.status(204).send();
});

// ====================== PROTECTED ROUTES ======================
api.use(authMiddleware);
api.use(tenantMiddleware);

// ====================== USERS ======================

/**
 * PUBLIC_INTERFACE
 * GET /users/me - Returns the authenticated user's profile.
 */
api.get('/users/me', async (req: Request, res: Response) => {
  /**
   * Uses req.user.sub to find user and returns basic profile.
   */
  const userId = (req.user as any)?.sub;
  const user = mem.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found', timestamp: new Date().toISOString(), path: req.originalUrl } });
  }
  return res.json({ id: user.id, email: user.email, name: user.name, roles: user.roles });
});

/**
 * PUBLIC_INTERFACE
 * PUT /users/me - Updates the authenticated user's profile (limited fields).
 */
api.put('/users/me', async (req: Request, res: Response) => {
  /**
   * Allows updating name only in this stub. Extend for preferences later.
   */
  const userId = (req.user as any)?.sub;
  const { name } = req.body || {};
  const user = mem.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found', timestamp: new Date().toISOString(), path: req.originalUrl } });
  }
  if (typeof name === 'string') user.name = name;
  return res.json({ id: user.id, email: user.email, name: user.name, roles: user.roles });
});

// ====================== DEVICES ======================

/**
 * PUBLIC_INTERFACE
 * GET /devices - Lists devices scoped by tenant with pagination.
 */
api.get('/devices', async (req: Request, res: Response) => {
  /**
   * Supports page and pageSize; filters by req.tenant (if present).
   */
  const tenantId = (req as any).tenant || (req.user as any)?.tenantId;
  const { page, pageSize, offset, limit } = getPagination(req, { page: 1, pageSize: 50 });

  let list = mem.devices;
  if (tenantId) list = list.filter((d) => d.tenantId === tenantId);

  const totalItems = list.length;
  const items = list.slice(offset, offset + limit);

  return res.json({
    items,
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
    hasNext: offset + limit < totalItems,
    hasPrevious: page > 1
  });
});

/**
 * PUBLIC_INTERFACE
 * POST /devices - Creates a new device in the current tenant.
 */
api.post('/devices', async (req: Request, res: Response) => {
  /**
   * Expects name and identifier; assigns current tenant. Stub ID generation with timestamp/random.
   */
  const tenantId = (req as any).tenant || (req.user as any)?.tenantId;
  if (!tenantId) {
    return res.status(400).json({ error: { code: 'TENANT_REQUIRED', message: 'Tenant context required', timestamp: new Date().toISOString(), path: req.originalUrl } });
  }
  const { name, identifier, mgmt_address, tags } = req.body || {};
  if (!name || !identifier) {
    return res.status(400).json({
      error: { code: 'BAD_REQUEST', message: 'name and identifier are required', timestamp: new Date().toISOString(), path: req.originalUrl }
    });
  }
  // Uniqueness within tenant on identifier (simulate)
  const conflict = mem.devices.find((d) => d.tenantId === tenantId && d.identifier === identifier);
  if (conflict) {
    return res.status(409).json({
      error: { code: 'CONFLICT', message: 'Device with identifier already exists in tenant', timestamp: new Date().toISOString(), path: req.originalUrl }
    });
  }
  const id = 'd-' + Math.random().toString(36).slice(2);
  const now = new Date().toISOString();
  const device = { id, tenantId, name, identifier, mgmt_address, tags: Array.isArray(tags) ? tags : [], created_at: now, updated_at: now };
  mem.devices.push(device);
  return res.status(201).json(device);
});

/**
 * PUBLIC_INTERFACE
 * GET /devices/:id - Fetch a device by id within tenant.
 */
api.get('/devices/:id', async (req: Request, res: Response) => {
  const tenantId = (req as any).tenant || (req.user as any)?.tenantId;
  const device = mem.devices.find((d) => d.id === req.params.id && (!tenantId || d.tenantId === tenantId));
  if (!device) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Device not found', timestamp: new Date().toISOString(), path: req.originalUrl } });
  }
  return res.json(device);
});

/**
 * PUBLIC_INTERFACE
 * PUT /devices/:id - Update a device within tenant.
 */
api.put('/devices/:id', async (req: Request, res: Response) => {
  const tenantId = (req as any).tenant || (req.user as any)?.tenantId;
  const idx = mem.devices.findIndex((d) => d.id === req.params.id && (!tenantId || d.tenantId === tenantId));
  if (idx === -1) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Device not found', timestamp: new Date().toISOString(), path: req.originalUrl } });
  }
  const cur = mem.devices[idx];
  const { name, identifier, mgmt_address, tags } = req.body || {};
  const next = {
    ...cur,
    name: typeof name === 'string' ? name : cur.name,
    identifier: typeof identifier === 'string' ? identifier : cur.identifier,
    mgmt_address: typeof mgmt_address === 'string' ? mgmt_address : cur.mgmt_address,
    tags: Array.isArray(tags) ? tags : cur.tags,
    updated_at: new Date().toISOString()
  };
  // Check identifier uniqueness if changed
  if (next.identifier !== cur.identifier) {
    const conflict = mem.devices.find((d) => d.tenantId === cur.tenantId && d.identifier === next.identifier && d.id !== cur.id);
    if (conflict) {
      return res.status(409).json({
        error: { code: 'CONFLICT', message: 'Device with identifier already exists in tenant', timestamp: new Date().toISOString(), path: req.originalUrl }
      });
    }
  }
  mem.devices[idx] = next;
  return res.json(next);
});

/**
 * PUBLIC_INTERFACE
 * DELETE /devices/:id - Remove a device within tenant.
 */
api.delete('/devices/:id', async (req: Request, res: Response) => {
  const tenantId = (req as any).tenant || (req.user as any)?.tenantId;
  const idx = mem.devices.findIndex((d) => d.id === req.params.id && (!tenantId || d.tenantId === tenantId));
  if (idx === -1) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Device not found', timestamp: new Date().toISOString(), path: req.originalUrl } });
  }
  mem.devices.splice(idx, 1);
  return res.status(204).send();
});

 // ====================== JOBS ======================

/**
 * PUBLIC_INTERFACE
 * GET /jobs - Lists jobs for tenant with live statuses.
 */
api.get('/jobs', async (req: Request, res: Response) => {
  /**
   * Returns queued/running/completed jobs filtered by tenant from queue job store.
   */
  const tenantId = (req as any).tenant || (req.user as any)?.tenantId;
  const { listJobs } = await import('./queue');
  const list = listJobs({ tenantId });
  return res.json(list);
});

/**
 * PUBLIC_INTERFACE
 * GET /jobs/:id - Returns job detail and results.
 */
api.get('/jobs/:id', async (req: Request, res: Response) => {
  const tenantId = (req as any).tenant || (req.user as any)?.tenantId;
  const { getJob } = await import('./queue');
  const job = getJob(req.params.id);
  if (!job || (tenantId && job.tenantId !== tenantId)) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Job not found', timestamp: new Date().toISOString(), path: req.originalUrl } });
  }
  return res.json(job);
});

import snmpRouter from './routes/protocols/snmp';
import webpaRouter from './routes/protocols/webpa';
import tr69Router from './routes/protocols/tr69';
import tr369Router from './routes/protocols/tr369';

// ====================== PROTOCOL ROUTES ======================
/**
 * PUBLIC_INTERFACE
 * Protocol operation routers:
 *  - SNMP:     /protocols/snmp/{get,set,walk}
 *  - WebPA:    /protocols/webpa/{get,set}
 *  - TR-069:   /protocols/tr69/{get,set}
 *  - TR-369:   /protocols/tr369/{get,set}
 *
 * All endpoints return 202 Accepted with { jobId } after enqueuing.
 */
api.use('/protocols/snmp', snmpRouter);
api.use('/protocols/webpa', webpaRouter);
api.use('/protocols/tr69', tr69Router);
api.use('/protocols/tr369', tr369Router);

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
