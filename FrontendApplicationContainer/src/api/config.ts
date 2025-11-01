const DEFAULT_API_BASE = 'http://localhost:8080/api/v1';
const DEFAULT_ENV = 'development';
const DEFAULT_POLL_INTERVAL_MS = 10_000;

/**
 * Parses feature flags from REACT_APP_FEATURE_FLAGS supporting:
 *  - JSON object: {"flagA":true,"flagB":false}
 *  - CSV list: flagA,flagB (interpreted as boolean true)
 */
function parseFeatureFlags(raw: string | undefined): Record<string, boolean> {
  if (!raw) return {};
  const trimmed = raw.trim();
  if (!trimmed) return {};
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') {
      const result: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        result[k] = Boolean(v);
      }
      return result;
    }
  } catch {
    // fall through to CSV parsing
  }
  // CSV parsing
  const flags: Record<string, boolean> = {};
  trimmed
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((k) => {
      flags[k] = true;
    });
  return flags;
}

/**
 * Reads poll interval from env; validates and falls back to default if invalid.
 */
function parsePollInterval(raw: string | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_POLL_INTERVAL_MS;
  return Math.floor(n);
}

// PUBLIC_INTERFACE
export function getApiBaseUrl(): string {
  /**
   * Returns API base URL from environment variable or default local URL.
   * Uses CRA environment variables (REACT_APP_*).
   */
  return process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE;
}

// PUBLIC_INTERFACE
export function getEnvName(): string {
  /**
   * Returns the app environment name from REACT_APP_ENV with 'development' default.
   */
  return process.env.REACT_APP_ENV || DEFAULT_ENV;
}

// PUBLIC_INTERFACE
export function getDefaultPollIntervalMs(): number {
  /**
   * Returns default polling interval (ms) from REACT_APP_POLL_INTERVAL_MS or sensible default.
   */
  return parsePollInterval(process.env.REACT_APP_POLL_INTERVAL_MS);
}

// PUBLIC_INTERFACE
export function getFeatureFlags(): Record<string, boolean> {
  /**
   * Returns feature flags parsed from REACT_APP_FEATURE_FLAGS (JSON or CSV), default {}.
   */
  return parseFeatureFlags(process.env.REACT_APP_FEATURE_FLAGS);
}
