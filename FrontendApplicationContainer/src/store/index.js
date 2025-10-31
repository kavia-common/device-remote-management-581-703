import { configureStore } from '@reduxjs/toolkit';
import auth from './slices/authSlice';
import devices from './slices/devicesSlice';
import queries from './slices/queriesSlice';

// PUBLIC_INTERFACE
/** Redux store configuration with slices */
const store = configureStore({
  reducer: {
    auth,
    devices,
    queries,
  },
});

export default store;
export { store };
