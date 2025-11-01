import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  theme: 'light' | 'dark';
  loading: boolean;
  error?: string | null;
}

const initialState: UiState = {
  theme: 'light',
  loading: false,
  error: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // PUBLIC_INTERFACE
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      document.documentElement.setAttribute('data-theme', action.payload);
    },
    // PUBLIC_INTERFACE
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    // PUBLIC_INTERFACE
    setError: (state, action: PayloadAction<string | null | undefined>) => {
      state.error = action.payload ?? null;
    },
  },
});

export const { setTheme, setLoading, setError } = uiSlice.actions;
export default uiSlice.reducer;
