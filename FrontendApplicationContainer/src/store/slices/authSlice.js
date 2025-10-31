import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as apiLogin, getCurrentUser as apiMe, logout as logoutApi } from '../../api/auth';

const normalizeError = (err) => err?.error ? err : { error: { code: 'CLIENT', message: 'Request failed', timestamp: new Date().toISOString() } };

// PUBLIC_INTERFACE
export const loginUser = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const data = await apiLogin({ email, password });
    return data;
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});

// PUBLIC_INTERFACE
export const fetchCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const data = await apiMe();
    return data;
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});

// PUBLIC_INTERFACE
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try { await logoutApi(); } catch { /* ignore */ }
  return true;
});

const slice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    currentTenant: localStorage.getItem('currentTenant') || localStorage.getItem('tenantId') || null,
    status: 'idle',
    error: null,
    isAuthenticated: !!localStorage.getItem('token'),
  },
  reducers: {
    // PUBLIC_INTERFACE
    setTenant(state, action) {
      state.currentTenant = action.payload || null;
      if (action.payload) localStorage.setItem('currentTenant', action.payload);
      else localStorage.removeItem('currentTenant');
    },
    // PUBLIC_INTERFACE
    setToken(state, action) {
      state.token = action.payload || null;
      if (action.payload) localStorage.setItem('token', action.payload);
      else localStorage.removeItem('token');
    },
    // PUBLIC_INTERFACE
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user || null;
        state.token = action.payload.token || null;
        state.isAuthenticated = !!action.payload.token;
        if (action.payload.token) localStorage.setItem('token', action.payload.token);
        if (action.payload.user) localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.error || action.error;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        const user = action.payload.user || action.payload || null;
        state.user = user;
        if (user) localStorage.setItem('user', JSON.stringify(user));
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.status = 'idle';
        state.error = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tenantId');
        localStorage.removeItem('currentTenant');
      });
  },
});

export const { setTenant, setToken, clearError } = slice.actions;
export default slice.reducer;

// PUBLIC_INTERFACE
/** Select current tenant identifier */
export const selectCurrentTenant = (state) => state.auth.currentTenant;
