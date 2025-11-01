const DEFAULT_API_BASE = 'http://localhost:8080/api/v1';

// PUBLIC_INTERFACE
export function getApiBaseUrl(): string {
  /**
   * Returns API base URL from environment variable or default local URL.
   * Uses CRA environment variables (REACT_APP_*).
   */
  return process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE;
}
