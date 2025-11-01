import React from 'react';
import { z } from 'zod';
import ProtocolOperation from './ProtocolOperation';

const tr369Schema = z.object({
  endpointId: z.string().min(1, 'Endpoint ID is required').default(''),
  command: z.enum(['Get', 'Set']).default('Get'),
  parameters: z.string().min(1, 'At least one parameter is required').default(''),
  payloadJson: z.string().optional().default(''),
});

type TR369Form = z.infer<typeof tr369Schema>;

const TR369: React.FC = () => {
  return (
    <ProtocolOperation<TR369Form>
      title="TR369 / USP"
      description="Execute USP operations on endpoints."
      endpoint="/protocols/tr369"
      schema={tr369Schema}
      renderFields={(form, onChange) => (
        <>
          <label>
            <div className="subtitle">Endpoint ID</div>
            <input
              type="text"
              placeholder="endpoint-123"
              value={form.endpointId ?? ''}
              onChange={(e) => onChange({ endpointId: e.target.value })}
              required
              style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', width: '100%' }}
            />
          </label>

          <label>
            <div className="subtitle">Command</div>
            <select
              value={form.command ?? 'Get'}
              onChange={(e) => onChange({ command: e.target.value as TR369Form['command'] })}
              style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
            >
              <option value="Get">Get</option>
              <option value="Set">Set</option>
            </select>
          </label>

          <label>
            <div className="subtitle">Parameters (comma or newline separated)</div>
            <textarea
              placeholder="Device.LocalAgent.EndpointID"
              value={form.parameters ?? ''}
              onChange={(e) => onChange({ parameters: e.target.value })}
              rows={4}
              style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', width: '100%' }}
            />
          </label>

          {form.command === 'Set' ? (
            <label>
              <div className="subtitle">Payload (JSON)</div>
              <textarea
                placeholder='{"Device.LocalAgent.Controller.1.Enable": true}'
                value={form.payloadJson ?? ''}
                onChange={(e) => onChange({ payloadJson: e.target.value })}
                rows={4}
                style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', width: '100%' }}
              />
            </label>
          ) : null}
        </>
      )}
      toPayload={(f) => {
        let payload: any = undefined;
        if (f.command === 'Set' && f.payloadJson) {
          try {
            payload = JSON.parse(f.payloadJson);
          } catch {
            payload = f.payloadJson;
          }
        }
        return {
          endpointId: f.endpointId,
          command: f.command,
          parameters: String(f.parameters)
            .split(/\n|,/)
            .map((s) => s.trim())
            .filter(Boolean),
          payload,
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

export default TR369;
