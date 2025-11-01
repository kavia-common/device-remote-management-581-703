import { z } from 'zod';
import { createProtocolJob } from '../jobService';

export const TR369OperationSchema = z.object({
  endpointId: z.string().min(1, 'endpointId is required'),
  command: z.enum(['Get', 'Set']),
  parameters: z.array(z.string().min(1)).min(1, 'At least one parameter is required'),
  payload: z.any().optional(), // for Set
});

export type TR369Operation = z.infer<typeof TR369OperationSchema>;

// PUBLIC_INTERFACE
export async function enqueueTR369Operation(input: TR369Operation, ctx?: { tenantId?: string; userId?: string }) {
  /** Validates TR-369 input and enqueues a job, returning jobId. */
  const payload = TR369OperationSchema.parse(input);
  const type = payload.command === 'Get' ? 'tr369.get' : 'tr369.set';
  return createProtocolJob(type, payload, ctx);
}
