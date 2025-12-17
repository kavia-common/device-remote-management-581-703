import { createTheme } from '@mui/material/styles';

/**
 * Theme configuration for the Device Remote Management application.
 * Supports both light and dark modes with custom palette, typography, and component overrides.
 * 
 * Usage:
 * - Import getTheme(mode) to create a theme for the specified mode ('light' or 'dark')
 * - Use with ThemeProvider from @mui/material/styles
 */

// Common typography settings
const typography = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  h4: {
    fontWeight: 600,
  },
  h5: {
    fontWeight: 600,
  },
  h6: {
    fontWeight: 600,
  },
};

// Common shape settings
const shape = {
  borderRadius: 8,
};

// Common spacing (default is 8px unit)
const spacing = 8;

// Light theme palette
const lightPalette = {
  mode: 'light',
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
};

// Dark theme palette
const darkPalette = {
  mode: 'dark',
  primary: {
    main: '#90caf9',
    light: '#e3f2fd',
    dark: '#42a5f5',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  secondary: {
    main: '#ce93d8',
    light: '#f3e5f5',
    dark: '#ab47bc',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  warning: {
    main: '#ffa726',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  info: {
    main: '#29b6f6',
    light: '#4fc3f7',
    dark: '#0288d1',
  },
  success: {
    main: '#66bb6a',
    light: '#81c784',
    dark: '#388e3c',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
  },
};

// Component overrides (applied to both themes)
const getComponentOverrides = (mode) => ({
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        boxShadow: mode === 'dark' 
          ? '0 2px 4px rgba(0,0,0,0.5)' 
          : '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: mode === 'dark'
            ? '0 4px 8px rgba(0,0,0,0.6)'
            : '0 4px 8px rgba(0,0,0,0.15)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: mode === 'dark'
          ? '0 2px 4px rgba(0,0,0,0.5)'
          : '0 2px 4px rgba(0,0,0,0.1)',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundImage: 'none',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: mode === 'dark' 
          ? '1px solid rgba(255, 255, 255, 0.12)' 
          : '1px solid rgba(0, 0, 0, 0.12)',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 500,
      },
    },
  },
});

// PUBLIC_INTERFACE
/**
 * Creates a Material-UI theme based on the specified mode.
 * @param {string} mode - Theme mode: 'light' or 'dark'
 * @returns {Theme} Material-UI theme object
 */
export function getTheme(mode = 'light') {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  
  return createTheme({
    palette,
    typography,
    shape,
    spacing,
    components: getComponentOverrides(mode),
  });
}

// Default exports
export default getTheme;
