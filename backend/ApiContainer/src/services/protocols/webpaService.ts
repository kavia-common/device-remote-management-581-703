import { z } from 'zod';
import { createProtocolJob } from '../jobService';

export const WebPAOperationSchema = z.object({
  deviceId: z.string().min(1, 'deviceId is required'),
  action: z.enum(['get', 'set']),
  parameters: z.array(z.string().min(1)).min(1, 'At least one parameter is required'),
  values: z.any().optional(), // for set
});

export type WebPAOperation = z.infer<typeof WebPAOperationSchema>;

// PUBLIC_INTERFACE
export async function enqueueWebPAOperation(input: WebPAOperation, ctx?: { tenantId?: string; userId?: string }) {
  /** Validates WebPA input and enqueues a job, returning jobId. */
  const payload = WebPAOperationSchema.parse(input);
  const type = `webpa.${payload.action}`;
  return createProtocolJob(type, payload, ctx);
}
