import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
    autoHideDuration: 4000,
  },
};

const slice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // PUBLIC_INTERFACE
    showSnackbar(state, action) {
      const { message, severity = 'info', autoHideDuration = 4000 } = action.payload || {};
      state.snackbar = { open: true, message, severity, autoHideDuration };
    },
    // PUBLIC_INTERFACE
    hideSnackbar(state) {
      state.snackbar.open = false;
    },
  },
});

export const { showSnackbar, hideSnackbar } = slice.actions;
// PUBLIC_INTERFACE
export const selectSnackbar = (state) => state.ui.snackbar;

export default slice.reducer;
