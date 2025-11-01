import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { enqueueSnmpOperation, SnmpOperationSchema } from '../../services/protocols/snmpService';

const router = Router();

// Base schema to reuse for each handler with fixed operation
const BaseSchema = SnmpOperationSchema;

// Helper to build handler for specific operation
function buildHandler(op: 'get' | 'set' | 'walk') {
  const bodySchema = BaseSchema.refine((v) => v.operation === op, {
    message: `operation must be '${op}'`,
  });

  return async (req: Request, res: Response) => {
    try {
      const parsed = bodySchema.parse({ ...req.body, operation: op });
      const ctx = { tenantId: (req as any).tenant || (req.user as any)?.tenantId, userId: (req.user as any)?.sub };
      const { jobId } = await enqueueSnmpOperation(parsed, ctx);
      return res.status(202).json({ jobId });
    } catch (e: any) {
      const zerr = e as z.ZodError;
      if (zerr?.issues) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid SNMP request',
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
 * Routes for SNMP operations: GET, SET, WALK.
 * - POST /protocols/snmp/get
 * - POST /protocols/snmp/set
 * - POST /protocols/snmp/walk
 * Responds with { jobId } and 202 Accepted.
 */
router.post('/get', buildHandler('get'));
router.post('/set', buildHandler('set'));
router.post('/walk', buildHandler('walk'));

export default router;
