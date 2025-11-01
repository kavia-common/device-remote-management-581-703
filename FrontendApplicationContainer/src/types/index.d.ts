/* Global/shared types for the application */

// PUBLIC_INTERFACE
export interface ApiError {
  message: string;
  code?: string | number;
  status?: number;
  details?: string[] | Record<string, unknown>;
}

// PUBLIC_INTERFACE
export interface JwtTokens {
  accessToken: string;
  refreshToken?: string;
}

// Allow process.env for CRA-style env vars
declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_API_BASE_URL?: string;
    readonly REACT_APP_ENV?: 'development' | 'staging' | 'production' | string;
    readonly REACT_APP_POLL_INTERVAL_MS?: string;
    readonly REACT_APP_FEATURE_FLAGS?: string;
  }
}
