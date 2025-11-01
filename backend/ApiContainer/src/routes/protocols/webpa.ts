import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { enqueueWebPAOperation, WebPAOperationSchema } from '../../services/protocols/webpaService';

const router = Router();

function buildHandler(action: 'get' | 'set') {
  const bodySchema = WebPAOperationSchema.refine((v) => v.action === action, {
    message: `action must be '${action}'`,
  });

  return async (req: Request, res: Response) => {
    try {
      const parsed = bodySchema.parse({ ...req.body, action });
      const ctx = { tenantId: (req as any).tenant || (req.user as any)?.tenantId, userId: (req.user as any)?.sub };
      const { jobId } = await enqueueWebPAOperation(parsed, ctx);
      return res.status(202).json({ jobId });
    } catch (e: any) {
      const zerr = e as z.ZodError;
      if (zerr?.issues) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid WebPA request',
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
 * Routes for WebPA operations: GET and SET.
 * - POST /protocols/webpa/get
 * - POST /protocols/webpa/set
 */
router.post('/get', buildHandler('get'));
router.post('/set', buildHandler('set'));

export default router;
