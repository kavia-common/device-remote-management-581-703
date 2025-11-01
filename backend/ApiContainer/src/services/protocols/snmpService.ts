import { z } from 'zod';
import { createProtocolJob } from '../jobService';

export const SnmpOperationSchema = z.object({
  // Common
  target: z.string().min(1, 'target is required'),
  version: z.enum(['v2c', 'v3']),
  // v2c
  community: z.string().optional(),
  // v3
  username: z.string().optional(),
  authProtocol: z.enum(['none', 'MD5', 'SHA']).default('none'),
  authPassword: z.string().optional(),
  privProtocol: z.enum(['none', 'DES', 'AES']).default('none'),
  privPassword: z.string().optional(),

  // Operation specifics
  operation: z.enum(['get', 'set', 'walk']),
  oids: z.array(z.string().min(1, 'OID cannot be empty')).min(1, 'At least one OID required'),
  values: z
    .record(z.any())
    .optional()
    .refine((v) => v == null || typeof v === 'object', { message: 'values must be an object when provided' }),
});

export type SnmpOperation = z.infer<typeof SnmpOperationSchema>;

// PUBLIC_INTERFACE
export async function enqueueSnmpOperation(input: SnmpOperation, ctx?: { tenantId?: string; userId?: string }) {
  /** Validates SNMP input and enqueues a job, returning jobId. */
  const payload = SnmpOperationSchema.parse(input);
  const type = `snmp.${payload.operation}`;
  return createProtocolJob(type, payload, ctx);
}
