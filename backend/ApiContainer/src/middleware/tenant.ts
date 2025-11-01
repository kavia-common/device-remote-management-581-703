import { Request, Response, NextFunction } from 'express';

/**
 * PUBLIC_INTERFACE
 * Extracts tenant context from headers (x-tenant-id or x-tenant-slug) or req.user.
 */
export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  /** Ensures a tenant context is present for multi-tenant isolation. */
  const tenantIdHeader = (req.headers['x-tenant-id'] as string | undefined)?.trim();
  const tenantSlugHeader = (req.headers['x-tenant-slug'] as string | undefined)?.trim();
  const tenantIdFromUser = (req.user as any)?.tenantId;

  const tenant = tenantIdHeader || tenantSlugHeader || tenantIdFromUser;
  if (!tenant) {
    // Non-strict mode: allow anonymous routes to proceed. Strict routes should mount auth before this middleware.
    return next();
  }

  // Attach normalized tenant identifier
  (req as any).tenant = tenant;
  return next();
}
