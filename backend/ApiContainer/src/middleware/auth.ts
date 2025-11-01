import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

declare global {
  namespace Express {
    // Augment Request with user field
    interface Request {
      user?: { sub?: string; tenantId?: string; roles?: string[]; [k: string]: any };
    }
  }
}

/**
 * PUBLIC_INTERFACE
 * Express middleware that authenticates requests via Bearer JWT.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  /** Parses Authorization header and verifies JWT, placing payload on req.user. */
  const authHeader = req.headers['authorization'] || '';
  const [scheme, token] = String(authHeader).split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header', timestamp: new Date().toISOString(), path: req.originalUrl }
    });
  }
  try {
    const decoded = verifyToken<any>(token);
    req.user = decoded;
    return next();
  } catch (e) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token', timestamp: new Date().toISOString(), path: req.originalUrl }
    });
  }
}
