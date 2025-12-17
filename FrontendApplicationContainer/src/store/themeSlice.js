import { createSlice } from '@reduxjs/toolkit';

const THEME_STORAGE_KEY = 'theme-mode';

/**
 * Detect system color scheme preference
 */
function getSystemPreference() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/**
 * Load theme preference from localStorage
 */
function loadThemePreference() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch (e) {
    // localStorage not available
  }
  return getSystemPreference();
}

/**
 * Save theme preference to localStorage
 */
function saveThemePreference(mode) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (e) {
    // localStorage not available
  }
}

const initialState = {
  mode: loadThemePreference(),
};

const slice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    // PUBLIC_INTERFACE
    toggleTheme(state) {
      /** Toggle between light and dark mode */
      const newMode = state.mode === 'light' ? 'dark' : 'light';
      state.mode = newMode;
      saveThemePreference(newMode);
    },
    // PUBLIC_INTERFACE
    setThemeMode(state, action) {
      /** Set theme mode explicitly */
      const mode = action.payload;
      if (mode === 'light' || mode === 'dark') {
        state.mode = mode;
        saveThemePreference(mode);
      }
    },
  },
});

export const { toggleTheme, setThemeMode } = slice.actions;

// PUBLIC_INTERFACE
export const selectThemeMode = (state) => state.theme.mode;

export default slice.reducer;
