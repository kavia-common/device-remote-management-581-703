import React from 'react';
import { z } from 'zod';
import ProtocolOperation from './ProtocolOperation';

const webpaSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required').default(''),
  parameters: z.string().min(1, 'At least one parameter is required').default(''),
  action: z.enum(['get', 'set']).default('get'),
  setPayload: z.string().optional().default(''),
});

type WebPAForm = z.infer<typeof webpaSchema>;

const WebPA: React.FC = () => {
  return (
    <ProtocolOperation<WebPAForm>
      title="WebPA"
      description="Query or set WebPA parameters on device."
      endpoint="/protocols/webpa"
      schema={webpaSchema}
      renderFields={(form, onChange) => (
        <>
          <label>
            <div className="subtitle">Device ID</div>
            <input
              type="text"
              placeholder="device-123"
              value={form.deviceId ?? ''}
              onChange={(e) => onChange({ deviceId: e.target.value })}
              required
              style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', width: '100%' }}
            />
          </label>

          <label>
            <div className="subtitle">Action</div>
            <select
              value={form.action ?? 'get'}
              onChange={(e) => onChange({ action: e.target.value as WebPAForm['action'] })}
              style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
            >
              <option value="get">Get</option>
              <option value="set">Set</option>
            </select>
          </label>

          <label>
            <div className="subtitle">Parameters (comma or newline separated)</div>
            <textarea
              placeholder="Device.X_RDK_DeviceDeviceInfo.SerialNumber"
              value={form.parameters ?? ''}
              onChange={(e) => onChange({ parameters: e.target.value })}
              rows={4}
              style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', width: '100%' }}
            />
          </label>

          {form.action === 'set' ? (
            <label>
              <div className="subtitle">Set Payload (JSON)</div>
              <textarea
                placeholder='{"param":"value"}'
                value={form.setPayload ?? ''}
                onChange={(e) => onChange({ setPayload: e.target.value })}
                rows={4}
                style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', width: '100%' }}
              />
            </label>
          ) : null}
        </>
      )}
      toPayload={(f) => {
        let parsed: any = undefined;
        if (f.action === 'set' && f.setPayload) {
          try {
            parsed = JSON.parse(f.setPayload);
          } catch {
            // Leave as string if invalid; backend can validate
            parsed = f.setPayload;
          }
        }
        return {
          deviceId: f.deviceId,
          action: f.action,
          parameters: String(f.parameters)
            .split(/\n|,/)
            .map((s) => s.trim())
            .filter(Boolean),
          values: parsed,
        };
      }}
      resultsToRows={(results) => {
        // Expect array of { parameter, value, status }
        if (!Array.isArray(results)) return [];
        return results.map((r: any) => ({
          parameter: r?.parameter,
          value: r?.value,
          status: r?.status,
        }));
      }}
    />
  );
};

export default WebPA;
