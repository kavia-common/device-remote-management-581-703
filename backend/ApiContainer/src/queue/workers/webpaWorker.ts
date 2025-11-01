import { Job } from 'bullmq';

type ProgressCb = (p: number) => Promise<void> | void;

// PUBLIC_INTERFACE
export async function processWebpaJob(job: Job | { id: string; name: string; data: any }, reportProgress: ProgressCb) {
  /** Simulated WebPA worker processor producing standard result shape. */
  const payload = job.data?.payload || {};
  const action = String(job.name).split('.')[1] as 'get' | 'set';
  const now = () => new Date().toISOString();

  await reportProgress(10);
  await sleep(120);

  let result: any;
  if (action === 'get') {
    result = {
      protocol: 'webpa',
      action: 'get',
      deviceId: payload.deviceId,
      parameters: payload.parameters,
      values: payload.parameters.reduce((acc: any, p: string, idx: number) => {
        acc[p] = `webpa_value_${idx}`;
        return acc;
      }, {}),
      started_at: now(),
      completed_at: now()
    };
  } else {
    result = {
      protocol: 'webpa',
      action: 'set',
      deviceId: payload.deviceId,
      parameters: payload.parameters,
      applied: true,
      requestedValues: payload.values,
      started_at: now(),
      completed_at: now()
    };
  }

  await reportProgress(90);
  await sleep(100);
  await reportProgress(100);
  return result;
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
