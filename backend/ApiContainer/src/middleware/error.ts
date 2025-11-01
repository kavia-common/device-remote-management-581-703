import { NextFunction, Request, Response } from 'express';

/**
 * PUBLIC_INTERFACE
 * Express error handler to format errors as JSON responses.
 */
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  /** Converts thrown errors or rejections into standardized error JSON. */
  const status = err?.status || err?.statusCode || 500;
  // eslint-disable-next-line no-console
  if (status >= 500) console.error('Unhandled error:', err);

  return res.status(status).json({
    error: {
      code: err?.code || (status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST'),
      message: err?.message || 'An unexpected error occurred',
      details: err?.details,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }
  });
}
