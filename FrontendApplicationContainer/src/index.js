import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { setStore } from './api/storeRef';
import store from './store';
import { initAuthFromStorage } from './store/authSlice';

setStore(store);

// Initialize auth from localStorage before render
store.dispatch(initAuthFromStorage());

const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = createTheme({
  palette: {
    mode: prefersDark ? 'dark' : 'light',
    primary: { main: '#1976d2' },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
