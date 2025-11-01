import { z } from 'zod';

// CENTRALIZED QUEUE + WORKER SETUP
// - Uses BullMQ (Redis) if REDIS_URL is set
// - Falls back to in-memory queue with basic processing if Redis is not configured
// - Exposes enqueue API and a lightweight in-memory job status store used by /jobs endpoints

import { env } from '../config/env';

type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

// Minimal shared job status store (used by /jobs endpoints). In a DB-backed system,
// this would persist into tables: jobs, job_events, protocol_results.
export type JobRecord = {
  id: string;
  type: string;
  payload: any;
  tenantId?: string;
  userId?: string;
  status: JobStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  result?: any;
  error?: { message: string; stack?: string };
};

const jobStore: Map<string, JobRecord> = new Map();

// PUBLIC_INTERFACE
export function getJob(jobId: string): JobRecord | undefined {
  /** Returns a job from the in-memory job store. */
  return jobStore.get(jobId);
}

// PUBLIC_INTERFACE
export function listJobs(filter?: { tenantId?: string }): JobRecord[] {
  /** Returns jobs from the in-memory store optionally filtered by tenantId. */
  const items = Array.from(jobStore.values());
  if (filter?.tenantId) return items.filter((j) => j.tenantId === filter.tenantId);
  return items;
}

export const EnqueueJobSchema = z.object({
  type: z.string().min(1, 'type is required'),
  payload: z.any(),
  tenantId: z.string().optional(),
  userId: z.string().optional()
});

export type EnqueueJobInput = z.infer<typeof EnqueueJobSchema>;

// BullMQ types are imported lazily to avoid requiring Redis packages in fallback mode
type BullQueue = any;
type BullWorker = any;

// Global singletons
let queue: BullQueue | null = null;
let workersStarted = false;

// Utility to generate job ids
function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Initialize BullMQ if Redis is configured
async function ensureQueue(): Promise<BullQueue | null> {
  if (queue !== null) return queue;
  if (!env.REDIS_URL) {
    queue = null;
    return null;
  }
  // Dynamically import to keep fallback light
  const { Queue } = await import('bullmq');
  queue = new Queue('protocol-jobs', {
    connection: { url: env.REDIS_URL }
  });
  return queue;
}

// Start workers for each protocol when Redis is present
export async function startWorkers() {
  /** Starts BullMQ workers for SNMP, WebPA, TR69, TR369 when Redis is configured. No-op in in-memory mode. */
  if (workersStarted) return;
  if (!env.REDIS_URL) {
    workersStarted = true;
    return; // in-memory worker(s) attached on enqueue per job
  }

  const { Worker } = await import('bullmq');

  // Import the worker processors
  const { processSnmpJob } = await import('./workers/snmpWorker');
  const { processWebpaJob } = await import('./workers/webpaWorker');
  const { processTr69Job } = await import('./workers/tr69Worker');
  const { processTr369Job } = await import('./workers/tr369Worker');

  // A single queue with workers that branch on job name
  const commonProcessor = async (job: any) => {
    const record = jobStore.get(job.id) || {
      id: job.id,
      type: job.name,
      payload: job.data?.payload,
      tenantId: job.data?.tenantId,
      userId: job.data?.userId,
      status: 'queued' as JobStatus,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    // set running
    record.status = 'running';
    record.updatedAt = new Date().toISOString();
    jobStore.set(job.id, record);

    // Dispatch by job name prefix
    const name: string = job.name || '';
    try {
      let result: any;
      if (name.startsWith('snmp.')) {
        result = await processSnmpJob(job, (p) => job.updateProgress(p));
      } else if (name.startsWith('webpa.')) {
        result = await processWebpaJob(job, (p) => job.updateProgress(p));
      } else if (name.startsWith('tr69.')) {
        result = await processTr69Job(job, (p) => job.updateProgress(p));
      } else if (name.startsWith('tr369.')) {
        result = await processTr369Job(job, (p) => job.updateProgress(p));
      } else {
        throw new Error(`Unknown job type: ${name}`);
      }
      record.status = 'completed';
      record.progress = 100;
      record.result = result;
      record.updatedAt = new Date().toISOString();
      jobStore.set(job.id, record);
      return result;
    } catch (err: any) {
      record.status = 'failed';
      record.error = { message: err?.message || 'Job failed', stack: err?.stack };
      record.updatedAt = new Date().toISOString();
      jobStore.set(job.id, record);
      throw err;
    }
  };

  // Create the worker attached to the same queue name
  const worker: BullWorker = new Worker('protocol-jobs', commonProcessor, {
    connection: { url: env.REDIS_URL },
    concurrency: 5
  });

  // Optional: log errors
  worker.on('failed', (job: any, err: any) => {
    // eslint-disable-next-line no-console
    console.error(`Job ${job?.id} failed:`, err?.message);
  });

  workersStarted = true;
}

// In-memory processing: simple immediate execution with simulated progress and results
async function processInMemoryJob(record: JobRecord) {
  function touch(update: Partial<JobRecord>) {
    const current = jobStore.get(record.id)!;
    const next = { ...current, ...update, updatedAt: new Date().toISOString() };
    jobStore.set(record.id, next);
  }

  touch({ status: 'running', progress: 0 });

  const type = record.type;
  // Dynamically import processors but use lightweight, protocol-agnostic helpers
  if (type.startsWith('snmp.')) {
    const { processSnmpJob } = await import('./workers/snmpWorker');
    const result = await processSnmpJob(
      { id: record.id, name: record.type, data: { payload: record.payload, tenantId: record.tenantId, userId: record.userId } } as any,
      (p: number) => touch({ progress: p })
    );
    touch({ status: 'completed', progress: 100, result });
    return;
  }
  if (type.startsWith('webpa.')) {
    const { processWebpaJob } = await import('./workers/webpaWorker');
    const result = await processWebpaJob(
      { id: record.id, name: record.type, data: { payload: record.payload, tenantId: record.tenantId, userId: record.userId } } as any,
      (p: number) => touch({ progress: p })
    );
    touch({ status: 'completed', progress: 100, result });
    return;
  }
  if (type.startsWith('tr69.')) {
    const { processTr69Job } = await import('./workers/tr69Worker');
    const result = await processTr69Job(
      { id: record.id, name: record.type, data: { payload: record.payload, tenantId: record.tenantId, userId: record.userId } } as any,
      (p: number) => touch({ progress: p })
    );
    touch({ status: 'completed', progress: 100, result });
    return;
  }
  if (type.startsWith('tr369.')) {
    const { processTr369Job } = await import('./workers/tr369Worker');
    const result = await processTr369Job(
      { id: record.id, name: record.type, data: { payload: record.payload, tenantId: record.tenantId, userId: record.userId } } as any,
      (p: number) => touch({ progress: p })
    );
    touch({ status: 'completed', progress: 100, result });
    return;
  }
  // Unknown
  touch({ status: 'failed', error: { message: `Unknown job type ${type}` } });
}

// PUBLIC_INTERFACE
export async function enqueueJob(input: EnqueueJobInput): Promise<{ jobId: string }> {
  /**
   * Enqueues a job either into BullMQ (Redis) or processes in-memory if Redis missing.
   * Always records a JobRecord in jobStore for /jobs endpoints.
   */
  const parsed = EnqueueJobSchema.parse(input);
  const jobId = genId(parsed.type);

  // Initialize the JobRecord
  const record: JobRecord = {
    id: jobId,
    type: parsed.type,
    payload: parsed.payload,
    tenantId: parsed.tenantId,
    userId: parsed.userId,
    status: 'queued',
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  jobStore.set(jobId, record);

  const q = await ensureQueue();

  if (q) {
    // BullMQ enqueue
    await startWorkers();
    await q.add(parsed.type, { payload: parsed.payload, tenantId: parsed.tenantId, userId: parsed.userId }, { jobId });
  } else {
    // In-memory immediate processing (async, non-blocking)
    setTimeout(() => {
      processInMemoryJob(record).catch((err) => {
        const failed = jobStore.get(jobId);
        if (failed) {
          failed.status = 'failed';
          failed.error = { message: err?.message || 'Job failed', stack: err?.stack };
          failed.updatedAt = new Date().toISOString();
          jobStore.set(jobId, failed);
        }
      });
    }, 0);
  }

  return { jobId };
}

// PUBLIC_INTERFACE
export function getProtocolResults(jobId: string) {
  /** Returns simplified protocol results for a job, if available. */
  const job = jobStore.get(jobId);
  if (!job) return undefined;
  return job.result;
}

// PUBLIC_INTERFACE
export function getQueueMode(): 'redis' | 'memory' {
  /** Returns which queue backend is currently active. */
  return env.REDIS_URL ? 'redis' : 'memory';
}
