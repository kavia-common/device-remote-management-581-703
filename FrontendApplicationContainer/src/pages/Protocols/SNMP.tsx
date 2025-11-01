import React from 'react';
import { z } from 'zod';
import ProtocolOperation from './ProtocolOperation';

// Provide safe defaults to avoid undefined in enum-typed fields
const snmpSchema = z.object({
  target: z.string().min(1, 'Target is required').default(''),
  version: z.enum(['v2c', 'v3']).default('v2c'),
  community: z.string().optional().default(''),
  username: z.string().optional().default(''),
  authProtocol: z.enum(['none', 'MD5', 'SHA']).default('none'),
  authPassword: z.string().optional().default(''),
  privProtocol: z.enum(['none', 'DES', 'AES']).default('none'),
  privPassword: z.string().optional().default(''),
  oids: z.string().min(1, 'At least one OID is required').default(''),
  operation: z.enum(['get', 'walk']).default('get'),
});

type SnmpForm = z.infer<typeof snmpSchema>;

const SNMP: React.FC = () => {
  return (
    <ProtocolOperation<SnmpForm>
      title="SNMP"
      description="Execute SNMP operations (v2c/v3)."
      endpoint="/protocols/snmp"
      schema={snmpSchema}
      renderFields={(form, onChange) => (
        <>
          <label>
            <div className="subtitle">Target Host/IP</div>
            <input
              type="text"
              placeholder="192.168.0.1"
              value={form.target ?? ''}
              onChange={(e) => onChange({ target: e.target.value })}
              style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', width: '100%' }}
              required
            />
          </label>

          <label>
            <div className="subtitle">Version</div>
            <select
              value={form.version ?? 'v2c'}
              onChange={(e) => onChange({ version: e.target.value as SnmpForm['version'] })}
              style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
            >
              <option value="v2c">v2c</option>
              <option value="v3">v3</option>
            </select>
          </label>

          {form.version === 'v2c' ? (
            <label>
              <div className="subtitle">Community</div>
              <input
                type="text"
                placeholder="public"
                value={form.community ?? ''}
                onChange={(e) => onChange({ community: e.target.value })}
                style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', width: '100%' }}
              />
            </label>
          ) : (
            <>
              <label>
                <div className="subtitle">Username</div>
                <input
                  type="text"
                  placeholder="snmpuser"
                  value={form.username ?? ''}
                  onChange={(e) => onChange({ username: e.target.value })}
                  style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', width: '100%' }}
                />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label>
                  <div className="subtitle">Auth Protocol</div>
                  <select
                    value={form.authProtocol ?? 'none'}
                    onChange={(e) => onChange({ authProtocol: e.target.value as SnmpForm['authProtocol'] })}
                    style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
                  >
                    <option value="none">None</option>
                    <option value="MD5">MD5</option>
                    <option value="SHA">SHA</option>
                  </select>
                </label>
                <label>
                  <div className="subtitle">Auth Password</div>
                  <input
                    type="password"
                    placeholder="********"
                    value={form.authPassword ?? ''}
                    onChange={(e) => onChange({ authPassword: e.target.value })}
                    style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', width: '100%' }}
                  />
                </label>
                <label>
                  <div className="subtitle">Privacy Protocol</div>
                  <select
                    value={form.privProtocol ?? 'none'}
                    onChange={(e) => onChange({ privProtocol: e.target.value as SnmpForm['privProtocol'] })}
                    style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
                  >
                    <option value="none">None</option>
                    <option value="DES">DES</option>
                    <option value="AES">AES</option>
                  </select>
                </label>
                <label>
                  <div className="subtitle">Privacy Password</div>
                  <input
                    type="password"
                    placeholder="********"
                    value={form.privPassword ?? ''}
                    onChange={(e) => onChange({ privPassword: e.target.value })}
                    style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', width: '100%' }}
                  />
                </label>
              </div>
            </>
          )}

          <label>
            <div className="subtitle">Operation</div>
            <select
              value={form.operation ?? 'get'}
              onChange={(e) => onChange({ operation: e.target.value as SnmpForm['operation'] })}
              style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
            >
              <option value="get">GET</option>
              <option value="walk">WALK</option>
            </select>
          </label>

          <label>
            <div className="subtitle">OIDs (comma or newline separated)</div>
            <textarea
              placeholder="1.3.6.1.2.1.1.1.0"
              value={form.oids ?? ''}
              onChange={(e) => onChange({ oids: e.target.value })}
              rows={4}
              style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', width: '100%' }}
            />
          </label>
        </>
      )}
      toPayload={(f) => ({
        ...f,
        oids: String(f.oids)
          .split(/\n|,/)
          .map((s) => s.trim())
          .filter(Boolean),
      })}
      resultsToRows={(results) => {
        // Expecting array of { oid, value, type } or similar
        if (!Array.isArray(results)) return [];
        return results.map((r: any) => ({
          oid: r?.oid,
          value: r?.value,
          type: r?.type,
        }));
      }}
    />
  );
};

export default SNMP;
