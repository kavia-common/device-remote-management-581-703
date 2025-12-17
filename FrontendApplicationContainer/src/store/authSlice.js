import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginWithPassword, loadPersistedAuth, persistAuth, clearPersistedAuth } from '../api/auth';
import { showSnackbar } from './uiSlice';

const initialState = {
  token: null,
  refreshToken: null,
  user: null,
  loading: false,
  error: null,
};

// PUBLIC_INTERFACE
export const initAuthFromStorage = createAsyncThunk('auth/initFromStorage', async () => {
  return loadPersistedAuth();
});

// PUBLIC_INTERFACE
export const loginThunk = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await loginWithPassword({ email, password });
    return res;
  } catch (e) {
    return rejectWithValue(e?.response?.data || { message: e.message || 'Login failed' });
  }
});

// PUBLIC_INTERFACE
export const logoutThunk = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  clearPersistedAuth();
  dispatch(showSnackbar({ message: 'Logged out', severity: 'info' }));
  return {};
});

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // PUBLIC_INTERFACE
    loginSuccess(state, action) {
      const { token, refreshToken, user } = action.payload;
      state.token = token || null;
      state.refreshToken = refreshToken || null;
      state.user = user || null;
      persistAuth({ token, refreshToken, user });
    },
    // PUBLIC_INTERFACE
    logout(state) {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      clearPersistedAuth();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initAuthFromStorage.fulfilled, (state, action) => {
        const { token, refreshToken, user } = action.payload || {};
        state.token = token || null;
        state.refreshToken = refreshToken || null;
        state.user = user || null;
      })
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        const { token, refreshToken, user } = action.payload || {};
        state.loading = false;
        state.error = null;
        state.token = token || null;
        state.refreshToken = refreshToken || null;
        state.user = user || null;
        persistAuth({ token, refreshToken, user });
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { loginSuccess, logout } = slice.actions;

// PUBLIC_INTERFACE
export const selectIsAuthenticated = (state) => Boolean(state.auth.token);
// PUBLIC_INTERFACE
export const selectToken = (state) => state.auth.token;
// PUBLIC_INTERFACE
export const selectUser = (state) => state.auth.user;
// PUBLIC_INTERFACE
export const selectAuthLoading = (state) => state.auth.loading;
// PUBLIC_INTERFACE
export const selectAuthError = (state) => state.auth.error;

export default slice.reducer;
