import React, { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';
import http from '../../api/httpClient';
import { useJobs } from '../../hooks/useJobs';
import { exportCSV, exportJSON } from '../../utils/export';

export interface ProtocolOperationProps<TForm extends Record<string, unknown>> {
  title: string;
  description?: string;
  endpoint: string;
  // Accept any Zod schema; caller defines TForm they want to work with.
  schema: z.ZodTypeAny;
  /**
   * Render fields for the form. Provide current form state and change handler.
   */
  renderFields: (form: TForm, onChange: (patch: Partial<TForm>) => void) => React.ReactNode;
  /**
   * Optional transform before POST
   */
  toPayload?: (form: TForm) => unknown;
  /**
   * Optional function to map backend results to a flat table for CSV export.
   */
  resultsToRows?: (results: unknown) => Array<Record<string, unknown>>;
}

type JobInfo = {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
};

// PUBLIC_INTERFACE
export default function ProtocolOperation<TForm extends Record<string, unknown>>(
  props: ProtocolOperationProps<TForm>
): JSX.Element {
  /**
   * Generic protocol operation page:
   * - Validates form with zod
   * - Posts to a protocol endpoint to create a job
   * - Polls job status via useJobs (placeholder hook)
   * - Renders status and results with export utilities
   */
  const { title, description, endpoint, schema, renderFields, toPayload, resultsToRows } = props;

  // Initialize form using schema defaults where available without forcing validation errors
  const [form, setForm] = useState<TForm>(() => {
    try {
      const empty: Record<string, unknown> = {};
      // First try to parse empty object to pick defaults if schema allows
      const attempt = (schema as z.ZodTypeAny).safeParse(empty);
      if (attempt.success) {
        return attempt.data as TForm;
      }
      // Fall back to empty object; fields will be progressively filled via onChange and validated on submit
      return {} as TForm;
    } catch {
      return {} as TForm;
    }
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  // Leverage jobs polling
  const { data: jobsData } = useJobs();

  const currentJob: JobInfo | undefined = useMemo(() => {
    if (!jobId) return undefined;
    // Adapt this to match real jobs API once available
    // For now, we search in jobsData for a job with matching ID if it's an array
    if (Array.isArray(jobsData)) {
      return jobsData.find((j: any) => j?.id === jobId);
    }
    // Or if backend returns an object map
    if (jobsData && typeof jobsData === 'object' && jobId in (jobsData as Record<string, any>)) {
      return (jobsData as Record<string, any>)[jobId] as JobInfo;
    }
    return undefined;
  }, [jobsData, jobId]);

  const onChange = useCallback((patch: Partial<TForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const validate = useCallback(
    (data: TForm) => {
      const result = schema.safeParse(data);
      if (result.success) {
        setFormErrors({});
        return result.data;
      }
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.') || 'form';
        errors[path] = issue.message;
      });
      setFormErrors(errors);
      return null;
    },
    [schema]
  );

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      const valid = validate(form);
      if (!valid) {
        return;
      }
      setSubmitting(true);
      try {
        const payload = toPayload ? toPayload(valid) : valid;
        // Post to placeholder protocol endpoint; expected response includes a jobId
        const { data } = await http.post(endpoint, payload);
        const returnedJobId = data?.jobId ?? data?.id ?? null;
        if (!returnedJobId) {
          throw new Error('No job ID returned from server');
        }
        setJobId(String(returnedJobId));
      } catch (err: any) {
        setSubmitError(err?.response?.data?.message || err?.message || 'Submission failed');
      } finally {
        setSubmitting(false);
      }
    },
    [endpoint, form, toPayload, validate]
  );

  const onExportJSON = useCallback(() => {
    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}_results`;
    exportJSON(filename, currentJob?.result ?? {});
  }, [currentJob?.result, title]);

  const onExportCSV = useCallback(() => {
    if (!resultsToRows) return;
    const rows = resultsToRows(currentJob?.result ?? []);
    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}_results`;
    exportCSV(filename, rows);
  }, [currentJob?.result, resultsToRows, title]);

  return (
    <section>
      <h1 className="title">{title}</h1>
      {description ? <p className="description">{description}</p> : null}

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 720, textAlign: 'left' }}>
        {renderFields(form, onChange)}

        {/* Validation errors */}
        {Object.keys(formErrors).length > 0 ? (
          <div style={{ color: 'crimson', fontSize: 14 }}>
            {Object.entries(formErrors).map(([k, v]) => (
              <div key={k}>
                <strong>{k}:</strong> {v}
              </div>
            ))}
          </div>
        ) : null}

        {submitError ? <div style={{ color: 'crimson' }}>{submitError}</div> : null}

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="theme-toggle" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
          {jobId ? <span style={{ alignSelf: 'center' }}>Job ID: {jobId}</span> : null}
        </div>
      </form>

      {/* Job status and results */}
      {jobId ? (
        <div style={{ marginTop: 24, textAlign: 'left' }}>
          <h3>Job Status</h3>
          {!currentJob ? (
            <p>Checking job status...</p>
          ) : (
            <>
              <p>
                <strong>Status:</strong> {currentJob.status}
              </p>
              {currentJob.error ? (
                <p style={{ color: 'crimson' }}>
                  <strong>Error:</strong> {currentJob.error}
                </p>
              ) : null}
              {currentJob.result ? (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <button className="theme-toggle" onClick={onExportJSON} type="button">
                      Export JSON
                    </button>
                    {resultsToRows ? (
                      <button className="theme-toggle" onClick={onExportCSV} type="button">
                        Export CSV
                      </button>
                    ) : null}
                  </div>
                  <pre
                    style={{
                      background: '#f5f5f5',
                      padding: 12,
                      borderRadius: 8,
                      overflowX: 'auto',
                    }}
                  >
                    {JSON.stringify(currentJob.result, null, 2)}
                  </pre>
                </>
              ) : (
                <p>No results yet.</p>
              )}
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
