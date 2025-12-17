import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import themeReducer from './themeSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    theme: themeReducer,
  },
});

export { store };
export default store;
