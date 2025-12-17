# Theme Configuration

This directory contains the Material-UI theme configuration for the Device Remote Management application.

## Overview

The theme system provides a centralized configuration for:
- **Color palettes** (light and dark modes)
- **Typography** (font families, sizes, weights)
- **Spacing** (consistent spacing units)
- **Shape** (border radius)
- **Component overrides** (customized MUI component styles)

## Files

- **`index.js`** - Main theme configuration file exporting the `getTheme(mode)` function

## Usage

### Basic Usage

The theme is automatically applied at the root level in `src/index.js`. You don't need to manually apply it in most cases.

```javascript
import { getTheme } from './theme';

const theme = getTheme('light'); // or 'dark'
```

### Accessing Theme in Components

You can access the current theme in any component using MUI's `useTheme` hook:

```javascript
import { useTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <div style={{ backgroundColor: theme.palette.background.paper }}>
      Content
    </div>
  );
}
```

### Using Theme Colors

All theme colors are accessible via the theme object:

```javascript
// Primary colors
theme.palette.primary.main
theme.palette.primary.light
theme.palette.primary.dark

// Secondary colors
theme.palette.secondary.main

// Semantic colors
theme.palette.error.main
theme.palette.warning.main
theme.palette.info.main
theme.palette.success.main

// Background colors
theme.palette.background.default
theme.palette.background.paper

// Text colors
theme.palette.text.primary
theme.palette.text.secondary
theme.palette.text.disabled
```

### Using with sx Prop

The `sx` prop provides a shortcut for accessing theme values:

```javascript
<Box
  sx={{
    bgcolor: 'background.paper',
    color: 'text.primary',
    p: 2, // padding: theme.spacing(2)
    borderRadius: 1, // borderRadius: theme.shape.borderRadius
  }}
>
  Content
</Box>
```

## Customization

### Extending the Palette

To add new colors to the palette, edit `src/theme/index.js`:

```javascript
const lightPalette = {
  mode: 'light',
  // ... existing colors
  custom: {
    brandOrange: '#E87A41',
    brandDark: '#1A1A1A',
  },
};
```

Then use it in components:

```javascript
<Box sx={{ bgcolor: 'custom.brandOrange' }}>Content</Box>
```

### Overriding Component Styles

Component overrides are defined in the `getComponentOverrides` function. To customize a component globally:

```javascript
const getComponentOverrides = (mode) => ({
  // ... existing overrides
  MuiButton: {
    styleOverrides: {
      root: {
        // Your custom styles
        borderRadius: 20,
      },
    },
    defaultProps: {
      // Default props for all buttons
      disableElevation: true,
    },
  },
});
```

### Modifying Typography

Edit the `typography` object in `src/theme/index.js`:

```javascript
const typography = {
  fontFamily: '"Your Font", sans-serif',
  h4: {
    fontWeight: 700,
    fontSize: '2rem',
  },
  // ... other variants
};
```

### Adjusting Spacing

The default spacing unit is 8px. Modify it in `src/theme/index.js`:

```javascript
const spacing = 8; // Change to 4, 6, 10, etc.
```

Then use spacing multipliers in your components:

```javascript
<Box sx={{ p: 2 }}>  // padding: 16px (2 * 8px)
<Box sx={{ mt: 3 }}> // marginTop: 24px (3 * 8px)
```

## Dark Mode

### How Dark Mode Works

1. User preference is stored in `localStorage` under the key `theme-mode`
2. On app load, the preference is read and applied
3. If no preference exists, the system preference (`prefers-color-scheme`) is used
4. Users can toggle between light and dark modes using the theme toggle in the app header

### Dark Mode State Management

Dark mode state is managed in the Redux store via `themeSlice`. See `src/store/themeSlice.js` for implementation details.

### System Preference Detection

The app automatically detects the system's color scheme preference:

```javascript
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

### Persistence

Theme preference is persisted to `localStorage`:

```javascript
localStorage.setItem('theme-mode', 'dark'); // or 'light'
```

## Responsive Design

The theme includes responsive breakpoints:

```javascript
theme.breakpoints.values = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
}
```

Use them in components:

```javascript
<Box
  sx={{
    display: { xs: 'block', md: 'flex' },
    flexDirection: { xs: 'column', md: 'row' },
  }}
>
  Content
</Box>
```

## Accessibility

The theme ensures accessible color contrasts in both light and dark modes:

- Text contrast ratios meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Interactive elements have sufficient contrast
- Focus indicators are visible in both modes

## Best Practices

1. **Use theme values instead of hardcoded colors**
   - ✅ `sx={{ color: 'text.primary' }}`
   - ❌ `sx={{ color: '#000000' }}`

2. **Use spacing multipliers**
   - ✅ `sx={{ p: 2, m: 3 }}`
   - ❌ `sx={{ padding: '16px', margin: '24px' }}`

3. **Test in both light and dark modes**
   - Always verify your UI looks good in both themes

4. **Use semantic color names**
   - ✅ `color="error"` for error states
   - ✅ `color="success"` for success states

5. **Leverage component variants**
   - Use MUI's built-in variants before creating custom styles

## Troubleshooting

### Theme not applying

Ensure `ThemeProvider` wraps your app in `src/index.js`:

```javascript
<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

### Colors not switching in dark mode

Check that you're using theme values, not hardcoded colors:

```javascript
// Wrong
<Box sx={{ backgroundColor: '#ffffff' }}>

// Correct
<Box sx={{ bgcolor: 'background.paper' }}>
```

### Custom colors not working

Make sure you've added them to both light and dark palettes in `src/theme/index.js`.

## References

- [Material-UI Theming Documentation](https://mui.com/material-ui/customization/theming/)
- [Material-UI Default Theme](https://mui.com/material-ui/customization/default-theme/)
- [Material-UI Dark Mode](https://mui.com/material-ui/customization/dark-mode/)
