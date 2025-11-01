import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserInfo {
  id: string;
  email: string;
  name?: string;
  roles?: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: UserInfo | null;
}

const STORAGE_KEY = 'drm_auth_v1';

// Helper to read persisted auth from storage
function readPersistedAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    // basic validation
    if (parsed && typeof parsed === 'object') {
      return {
        isAuthenticated: Boolean(parsed.isAuthenticated && parsed.accessToken),
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
        user: parsed.user ?? null,
      };
    }
  } catch {
    // ignore
  }
  return null;
}

// Persist to storage
function persistAuth(state: AuthState) {
  try {
    const payload = {
      isAuthenticated: state.isAuthenticated,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      user: state.user,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

// Clear storage
function clearPersistedAuth() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

const initialStateFromStorage = readPersistedAuth();

const initialState: AuthState = initialStateFromStorage ?? {
  isAuthenticated: false,
  accessToken: undefined,
  refreshToken: undefined,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // PUBLIC_INTERFACE
    loginSuccess: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken?: string; user?: UserInfo | null }>
    ) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user ?? null;
      persistAuth(state);
    },
    // PUBLIC_INTERFACE
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = undefined;
      state.refreshToken = undefined;
      state.user = null;
      clearPersistedAuth();
    },
    // PUBLIC_INTERFACE
    setUser: (state, action: PayloadAction<UserInfo | null>) => {
      state.user = action.payload;
      persistAuth(state);
    },
    // PUBLIC_INTERFACE
    setAccessToken: (state, action: PayloadAction<string | undefined>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = Boolean(action.payload);
      persistAuth(state);
    },
    // PUBLIC_INTERFACE
    rehydrateFromStorage: (state) => {
      const stored = readPersistedAuth();
      if (stored) {
        state.isAuthenticated = stored.isAuthenticated;
        state.accessToken = stored.accessToken;
        state.refreshToken = stored.refreshToken;
        state.user = stored.user ?? null;
      }
    },
  },
});

export const { loginSuccess, logout, setUser, setAccessToken, rehydrateFromStorage } = authSlice.actions;
export default authSlice.reducer;
