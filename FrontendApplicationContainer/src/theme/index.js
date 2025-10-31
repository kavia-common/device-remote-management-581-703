import { createTheme } from '@mui/material/styles';

// Check if user prefers reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// PUBLIC_INTERFACE
/**
 * Material-UI theme configuration
 * Defines color palette, typography, and component overrides
 * Includes accessibility improvements: better contrast ratios (WCAG AA compliant)
 * and respects prefers-reduced-motion user preference
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565c0', // Darker for better contrast (was #1976d2)
      light: '#42a5f5',
      dark: '#0d47a1', // Darker for better contrast
      contrastText: '#fff',
    },
    secondary: {
      main: '#d84315', // Darker for better contrast (was #E87A41)
      light: '#ff6f00',
      dark: '#bf360c', // Darker for better contrast
      contrastText: '#fff', // Changed from #000 to #fff for better contrast
    },
    error: {
      main: '#c62828', // Darker for better contrast (was #d32f2f)
      light: '#ef5350',
      dark: '#b71c1c',
      contrastText: '#fff',
    },
    warning: {
      main: '#e65100', // Darker for better contrast (was #ed6c02)
      light: '#ff6f00',
      dark: '#bf360c',
      contrastText: '#fff',
    },
    info: {
      main: '#01579b', // Darker for better contrast (was #0288d1)
      light: '#0277bd',
      dark: '#004c8c',
      contrastText: '#fff',
    },
    success: {
      main: '#2e7d32', // Already good contrast
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)', // Ensures WCAG AA compliance
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    body1: {
      lineHeight: 1.5, // Better readability
    },
    body2: {
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          // Respect reduced motion preference
          transition: prefersReducedMotion 
            ? 'none' 
            : 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        // Global styles respecting reduced motion
        '*': prefersReducedMotion ? {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
          scrollBehavior: 'auto !important',
        } : {},
        // Focus visible styles for keyboard navigation
        '*:focus-visible': {
          outline: '2px solid #1565c0',
          outlineOffset: '2px',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          // Ensure links have sufficient color contrast
          '&:focus-visible': {
            outline: '2px solid #1565c0',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          // Better focus indicator for icon buttons
          '&:focus-visible': {
            outline: '2px solid #1565c0',
            outlineOffset: '2px',
          },
        },
      },
    },
  },
});

export default theme;
