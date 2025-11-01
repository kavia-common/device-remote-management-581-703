import { z } from 'zod';

/**
 * Simple in-memory job queue placeholder to be replaced with BullMQ later.
 * Generates a jobId and stores minimal metadata for visibility.
 */

export const EnqueueJobSchema = z.object({
  type: z.string().min(1, 'type is required'),
  payload: z.any(),
  tenantId: z.string().optional(),
  userId: z.string().optional(),
});

export type EnqueueJobInput = z.infer<typeof EnqueueJobSchema>;

type MemJob = {
  id: string;
  type: string;
  payload: unknown;
  tenantId?: string;
  userId?: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  createdAt: string;
};

// Minimal in-memory store for now
const memJobs: Record<string, MemJob> = {};

// PUBLIC_INTERFACE
export async function enqueueJob(input: EnqueueJobInput): Promise<{ jobId: string }> {
  /** Enqueues a job into an in-memory placeholder structure and returns jobId. */
  const parsed = EnqueueJobSchema.parse(input);
  const jobId = `${parsed.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  memJobs[jobId] = {
    id: jobId,
    type: parsed.type,
    payload: parsed.payload,
    tenantId: parsed.tenantId,
    userId: parsed.userId,
    status: 'queued',
    createdAt: new Date().toISOString(),
  };
  return { jobId };
}

// PUBLIC_INTERFACE
export function _debugGetMemJobs(): Record<string, MemJob> {
  /** Returns the in-memory jobs map (for potential diagnostics). */
  return memJobs;
}
