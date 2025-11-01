import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { enqueueTR69Operation, TR69OperationSchema } from '../../services/protocols/tr69Service';

const router = Router();

function buildHandler(action: 'GetParameterValues' | 'SetParameterValues') {
  const bodySchema = TR69OperationSchema.refine((v) => v.action === action, {
    message: `action must be '${action}'`,
  });

  return async (req: Request, res: Response) => {
    try {
      const parsed = bodySchema.parse({ ...req.body, action });
      const ctx = { tenantId: (req as any).tenant || (req.user as any)?.tenantId, userId: (req.user as any)?.sub };
      const { jobId } = await enqueueTR69Operation(parsed, ctx);
      return res.status(202).json({ jobId });
    } catch (e: any) {
      const zerr = e as z.ZodError;
      if (zerr?.issues) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid TR69 request',
            details: zerr.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
          },
        });
      }
      throw e;
    }
  };
}

/**
 * PUBLIC_INTERFACE
 * Routes for TR-069 operations.
 * - POST /protocols/tr69/get (GetParameterValues)
 * - POST /protocols/tr69/set (SetParameterValues)
 */
router.post('/get', buildHandler('GetParameterValues'));
router.post('/set', buildHandler('SetParameterValues'));

export default router;
