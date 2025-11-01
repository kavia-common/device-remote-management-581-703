import { Job } from 'bullmq';

type ProgressCb = (p: number) => Promise<void> | void;

// PUBLIC_INTERFACE
export async function processTr69Job(job: Job | { id: string; name: string; data: any }, reportProgress: ProgressCb) {
  /** Simulated TR-069 worker. */
  const payload = job.data?.payload || {};
  const action = String(job.name).split('.')[1] as 'get' | 'set';
  const now = () => new Date().toISOString();

  await reportProgress(15);
  await sleep(150);

  let result: any;
  if (action === 'get') {
    result = {
      protocol: 'tr69',
      action: 'GetParameterValues',
      deviceId: payload.deviceId,
      parameters: payload.parameters,
      values: payload.parameters.reduce((acc: any, p: string, idx: number) => {
        acc[p] = `tr69_value_${idx}`;
        return acc;
      }, {}),
      started_at: now(),
      completed_at: now()
    };
  } else {
    result = {
      protocol: 'tr69',
      action: 'SetParameterValues',
      deviceId: payload.deviceId,
      parameters: payload.parameters,
      applied: true,
      requestedValues: payload.values,
      started_at: now(),
      completed_at: now()
    };
  }

  await reportProgress(95);
  await sleep(80);
  await reportProgress(100);
  return result;
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
