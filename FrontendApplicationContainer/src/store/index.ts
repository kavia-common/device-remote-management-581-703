import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

// PUBLIC_INTERFACE
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
});

// PUBLIC_INTERFACE
export type RootState = ReturnType<typeof store.getState>;
// PUBLIC_INTERFACE
export type AppDispatch = typeof store.dispatch;
