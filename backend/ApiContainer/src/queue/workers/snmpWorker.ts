import { Job } from 'bullmq';

type ProgressCb = (p: number) => Promise<void> | void;

// PUBLIC_INTERFACE
export async function processSnmpJob(job: Job | { id: string; name: string; data: any }, reportProgress: ProgressCb) {
  /**
   * Simulated SNMP worker processor.
   * Updates progress and returns a protocol_results-like structure.
   * In a real system, this would perform network IO with SNMP libraries.
   */
  const payload = job.data?.payload || {};
  const now = () => new Date().toISOString();

  await reportProgress(5);
  await sleep(150);

  // Fake operation branching
  const op = String(job.name).split('.')[1] as 'get' | 'set' | 'walk';

  await reportProgress(35);
  await sleep(150);

  let result: any;
  if (op === 'get') {
    result = {
      protocol: 'snmp',
      operation: 'get',
      target: payload.target,
      version: payload.version,
      oids: payload.oids,
      values: payload.oids.reduce((acc: any, oid: string, idx: number) => {
        acc[oid] = `value_${idx}`;
        return acc;
      }, {}),
      started_at: now(),
      completed_at: now(),
      meta: { mode: 'simulated' }
    };
  } else if (op === 'set') {
    result = {
      protocol: 'snmp',
      operation: 'set',
      target: payload.target,
      version: payload.version,
      set: payload.values || {},
      status: 'ok',
      started_at: now(),
      completed_at: now(),
      meta: { mode: 'simulated' }
    };
  } else {
    // walk
    result = {
      protocol: 'snmp',
      operation: 'walk',
      target: payload.target,
      version: payload.version,
      walked: payload.oids,
      rows: payload.oids.map((oid: string, i: number) => ({ oid, value: `walk_val_${i}` })),
      started_at: now(),
      completed_at: now(),
      meta: { mode: 'simulated' }
    };
  }

  await reportProgress(80);
  await sleep(120);
  await reportProgress(100);
  return result;
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
