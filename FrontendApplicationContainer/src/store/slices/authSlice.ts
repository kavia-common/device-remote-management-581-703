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

const initialState: AuthState = {
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
    },
    // PUBLIC_INTERFACE
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = undefined;
      state.refreshToken = undefined;
      state.user = null;
    },
    // PUBLIC_INTERFACE
    setUser: (state, action: PayloadAction<UserInfo | null>) => {
      state.user = action.payload;
    },
    // PUBLIC_INTERFACE
    setAccessToken: (state, action: PayloadAction<string | undefined>) => {
      state.accessToken = action.payload;
    },
  },
});

export const { loginSuccess, logout, setUser, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
