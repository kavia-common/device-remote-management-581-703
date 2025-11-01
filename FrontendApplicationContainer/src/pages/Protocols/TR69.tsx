import React from 'react';
import { z } from 'zod';
import ProtocolOperation from './ProtocolOperation';

const tr69Schema = z.object({
  deviceId: z.string().min(1, 'Device ID is required').default(''),
  action: z.enum(['GetParameterValues', 'SetParameterValues']).default('GetParameterValues'),
  parameters: z.string().min(1, 'At least one parameter is required').default(''),
  valuesJson: z.string().optional().default(''),
});

type TR69Form = z.infer<typeof tr69Schema>;

const TR69: React.FC = () => {
  return (
    <ProtocolOperation<TR69Form>
      title="TR69 / ACS"
      description="Execute TR-069 operations through ACS."
      endpoint="/protocols/tr69"
      schema={tr69Schema}
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
              value={form.action ?? 'GetParameterValues'}
              onChange={(e) => onChange({ action: e.target.value as TR69Form['action'] })}
              style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
            >
              <option value="GetParameterValues">GetParameterValues</option>
              <option value="SetParameterValues">SetParameterValues</option>
            </select>
          </label>

          <label>
            <div className="subtitle">Parameters (comma or newline separated)</div>
            <textarea
              placeholder="Device.DeviceInfo.SerialNumber"
              value={form.parameters ?? ''}
              onChange={(e) => onChange({ parameters: e.target.value })}
              rows={4}
              style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', width: '100%' }}
            />
          </label>

          {form.action === 'SetParameterValues' ? (
            <label>
              <div className="subtitle">Values (JSON)</div>
              <textarea
                placeholder='{"Device.DeviceInfo.X_Example.Param":"value"}'
                value={form.valuesJson ?? ''}
                onChange={(e) => onChange({ valuesJson: e.target.value })}
                rows={4}
                style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', width: '100%' }}
              />
            </label>
          ) : null}
        </>
      )}
      toPayload={(f) => {
        let values: any = undefined;
        if (f.action === 'SetParameterValues' && f.valuesJson) {
          try {
            values = JSON.parse(f.valuesJson);
          } catch {
            values = f.valuesJson;
          }
        }
        return {
          deviceId: f.deviceId,
          action: f.action,
          parameters: String(f.parameters)
            .split(/\n|,/)
            .map((s) => s.trim())
            .filter(Boolean),
          values,
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

export default TR69;
