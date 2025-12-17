import { createSlice } from '@reduxjs/toolkit';

const TOKEN_KEY = 'drm_jwt';

const initialState = {
  token: typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
  user: null,
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // PUBLIC_INTERFACE
    loginSuccess(state, action) {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user || null;
      try {
        localStorage.setItem(TOKEN_KEY, token);
      } catch { /* noop */ }
    },
    // PUBLIC_INTERFACE
    logout(state) {
      state.token = null;
      state.user = null;
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch { /* noop */ }
    },
  },
});

export const { loginSuccess, logout } = slice.actions;

// PUBLIC_INTERFACE
export const selectIsAuthenticated = (state) => Boolean(state.auth.token);
// PUBLIC_INTERFACE
export const selectToken = (state) => state.auth.token;
// PUBLIC_INTERFACE
export const selectUser = (state) => state.auth.user;

export default slice.reducer;
