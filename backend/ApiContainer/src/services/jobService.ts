import { enqueueJob } from '../queue';

/**
 * Job service to abstract queue interaction for protocol requests.
 */

// PUBLIC_INTERFACE
export async function createProtocolJob(type: string, payload: unknown, ctx?: { tenantId?: string; userId?: string }) {
  /** Wraps enqueueJob with protocol-aware job type names and context propagation. */
  const { jobId } = await enqueueJob({
    type,
    payload,
    tenantId: ctx?.tenantId,
    userId: ctx?.userId,
  });
  return { jobId };
}
