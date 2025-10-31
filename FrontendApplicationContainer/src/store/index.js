import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import devicesReducer from './slices/devicesSlice';
import queriesReducer from './slices/queriesSlice';

// PUBLIC_INTERFACE
/**
 * Redux store configuration
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
    devices: devicesReducer,
    queries: queriesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['queries/addActiveQuery'],
      },
    }),
});

export default store;
