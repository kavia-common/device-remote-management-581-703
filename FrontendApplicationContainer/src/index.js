import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { Provider } from 'react-redux';
import { setStore } from './api/storeRef';
import store from './store';
import { initAuthFromStorage } from './store/authSlice';
import { selectThemeMode } from './store/themeSlice';
import { getTheme } from './theme';

setStore(store);

// Initialize auth from localStorage before render
store.dispatch(initAuthFromStorage());

// PUBLIC_INTERFACE
/**
 * Theme wrapper component that subscribes to theme state
 * and provides the appropriate theme to the app
 */
function ThemedApp() {
  const mode = useSelector(selectThemeMode);
  const theme = React.useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemedApp />
    </Provider>
  </React.StrictMode>
);
