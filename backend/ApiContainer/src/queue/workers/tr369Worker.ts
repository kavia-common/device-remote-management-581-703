import { Job } from 'bullmq';

type ProgressCb = (p: number) => Promise<void> | void;

// PUBLIC_INTERFACE
export async function processTr369Job(job: Job | { id: string; name: string; data: any }, reportProgress: ProgressCb) {
  /** Simulated TR-369/USP worker. */
  const payload = job.data?.payload || {};
  const cmd = String(job.name).split('.')[1] as 'get' | 'set';
  const now = () => new Date().toISOString();

  await reportProgress(20);
  await sleep(200);

  let result: any;
  if (cmd === 'get') {
    result = {
      protocol: 'tr369',
      command: 'Get',
      endpointId: payload.endpointId,
      parameters: payload.parameters,
      values: payload.parameters.reduce((acc: any, p: string, idx: number) => {
        acc[p] = `usp_value_${idx}`;
        return acc;
      }, {}),
      started_at: now(),
      completed_at: now()
    };
  } else {
    result = {
      protocol: 'tr369',
      command: 'Set',
      endpointId: payload.endpointId,
      parameters: payload.parameters,
      applied: true,
      payload: payload.payload,
      started_at: now(),
      completed_at: now()
    };
  }

  await reportProgress(100);
  return result;
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
