import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { enqueueTR369Operation, TR369OperationSchema } from '../../services/protocols/tr369Service';

const router = Router();

function buildHandler(command: 'Get' | 'Set') {
  const bodySchema = TR369OperationSchema.refine((v) => v.command === command, {
    message: `command must be '${command}'`,
  });

  return async (req: Request, res: Response) => {
    try {
      const parsed = bodySchema.parse({ ...req.body, command });
      const ctx = { tenantId: (req as any).tenant || (req.user as any)?.tenantId, userId: (req.user as any)?.sub };
      const { jobId } = await enqueueTR369Operation(parsed, ctx);
      return res.status(202).json({ jobId });
    } catch (e: any) {
      const zerr = e as z.ZodError;
      if (zerr?.issues) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid TR369 request',
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
 * Routes for TR-369/USP operations.
 * - POST /protocols/tr369/get
 * - POST /protocols/tr369/set
 */
router.post('/get', buildHandler('Get'));
router.post('/set', buildHandler('Set'));

export default router;
