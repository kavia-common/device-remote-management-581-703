import { z } from 'zod';
import { createProtocolJob } from '../jobService';

export const TR69OperationSchema = z.object({
  deviceId: z.string().min(1, 'deviceId is required'),
  action: z.enum(['GetParameterValues', 'SetParameterValues']),
  parameters: z.array(z.string().min(1)).min(1, 'At least one parameter is required'),
  values: z.any().optional(), // for SetParameterValues
});

export type TR69Operation = z.infer<typeof TR69OperationSchema>;

// PUBLIC_INTERFACE
export async function enqueueTR69Operation(input: TR69Operation, ctx?: { tenantId?: string; userId?: string }) {
  /** Validates TR-069 input and enqueues a job, returning jobId. */
  const payload = TR69OperationSchema.parse(input);
  const type =
    payload.action === 'GetParameterValues' ? 'tr69.get' : 'tr69.set';
  return createProtocolJob(type, payload, ctx);
}
