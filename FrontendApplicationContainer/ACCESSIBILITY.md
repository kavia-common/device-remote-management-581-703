# Accessibility Implementation Guide

This document outlines the accessibility features implemented in the Device Remote Management platform and provides guidelines for maintaining and extending these features.

## Overview

The platform is designed to meet WCAG 2.1 Level AA standards for web accessibility, ensuring that all users, including those with disabilities, can effectively use the application.

## Implemented Features

### 1. Skip-to-Content Link

**Location:** `src/components/Layout.js`

A skip-to-content link is provided at the top of every page, allowing keyboard users to bypass repetitive navigation and jump directly to the main content.

**Usage:**
- Press `Tab` key on page load
- The skip link becomes visible
- Press `Enter` to jump to main content

### 2. Semantic Landmark Roles

**Location:** `src/components/Layout.js`

Semantic HTML5 landmarks and ARIA roles are used throughout the application:

- `<header role="banner">` - Top navigation bar
- `<nav role="navigation">` - Side navigation drawer
- `<main role="main">` - Primary content area
- Forms have appropriate `aria-label` attributes

**Benefits:**
- Screen readers can navigate by landmarks
- Improved document structure
- Better semantic meaning

### 3. ARIA Live Regions

**Location:** `src/components/StatusAnnouncer.js`

An `aria-live="polite"` region announces asynchronous job status updates to screen readers without interrupting the user's current activity.

**Announcements include:**
- Job completion notifications
- Job failure alerts
- Active job count updates

### 4. Focus Management

**Location:** `src/components/Layout.js`, `src/hooks/useFocusManagement.js`

Focus is automatically managed when users navigate between routes:

- Main content receives focus on route change
- Focus is moved to a logical starting point
- Page title changes are announced
- Keyboard trap prevention

**Implementation:**
```javascript
import useFocusManagement from '../hooks/useFocusManagement';

const MyComponent = () => {
  const containerRef = useFocusManagement();
  return <div ref={containerRef} tabIndex={-1}>...</div>;
};
```

### 5. Enhanced Color Contrast

**Location:** `src/theme/index.js`

All color combinations meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text):

- Primary color: `#1565c0` (improved from `#1976d2`)
- Secondary color: `#d84315` (improved from `#E87A41`)
- Error color: `#c62828` (improved from `#d32f2f`)
- Warning color: `#e65100` (improved from `#ed6c02`)
- Info color: `#01579b` (improved from `#0288d1`)

### 6. Reduced Motion Support

**Location:** `src/theme/index.js`

The application respects the `prefers-reduced-motion` user preference:

- Animations are disabled or minimized
- Transitions are reduced to near-instant
- Scroll behavior is set to `auto` instead of `smooth`

**How it works:**
```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

### 7. Form Accessibility

**Locations:** `src/pages/Login.js`, `src/pages/Register.js`

All form controls have proper labels and associations:

- TextField components use the `label` prop (creates proper `<label>` elements)
- Form regions have `aria-label` or `aria-labelledby` attributes
- Error messages are associated with form fields
- Submit buttons clearly indicate their purpose

## Best Practices for Developers

### When Adding New Forms

1. Always use the `label` prop on form controls
2. Add `aria-label` to the form container
3. Ensure error messages are announced to screen readers
4. Use semantic HTML elements (`<form>`, `<button>`, etc.)

Example:
```javascript
<Box component="form" aria-label="Device configuration form">
  <TextField
    id="device-name"
    label="Device Name"
    required
    aria-required="true"
  />
</Box>
```

### When Adding New Interactive Elements

1. Ensure keyboard accessibility (all functionality available via keyboard)
2. Add appropriate ARIA labels
3. Provide visible focus indicators
4. Use semantic HTML where possible

### When Adding Status Updates

Use the StatusAnnouncer pattern for important updates:

```javascript
// In your Redux slice
dispatch(updateJobStatus({ id, status, message }));
// StatusAnnouncer will automatically announce this to screen readers
```

### When Creating New Pages

1. Use the `useFocusManagement` hook for proper focus handling
2. Set a descriptive page title
3. Structure content with proper heading hierarchy (h1 → h2 → h3)
4. Include landmark regions

Example:
```javascript
import useFocusManagement from '../hooks/useFocusManagement';

const MyPage = () => {
  const containerRef = useFocusManagement();
  
  useEffect(() => {
    document.title = 'My Page - Device Remote Management';
  }, []);
  
  return (
    <Box ref={containerRef} tabIndex={-1}>
      <Typography component="h1" variant="h4">My Page</Typography>
      {/* content */}
    </Box>
  );
};
```

## Testing Accessibility

### Automated Testing

Run the following tools regularly:

1. **axe DevTools** (browser extension)
2. **Lighthouse** accessibility audit (Chrome DevTools)
3. **WAVE** Web Accessibility Evaluation Tool

### Manual Testing

1. **Keyboard Navigation:**
   - Tab through all interactive elements
   - Ensure visible focus indicators
   - Test keyboard shortcuts

2. **Screen Reader Testing:**
   - NVDA (Windows)
   - JAWS (Windows)
   - VoiceOver (macOS/iOS)
   - TalkBack (Android)

3. **Color Contrast:**
   - Use browser DevTools to check contrast ratios
   - Test in high contrast mode

4. **Motion Preferences:**
   - Enable "Reduce motion" in OS settings
   - Verify animations are disabled

## Common ARIA Patterns

### Buttons
```javascript
<Button aria-label="Delete device">
  <DeleteIcon />
</Button>
```

### Loading States
```javascript
<Button disabled aria-busy="true">
  <CircularProgress size={20} />
  Loading...
</Button>
```

### Expandable Sections
```javascript
<Button
  aria-expanded={isOpen}
  aria-controls="section-content"
  onClick={toggle}
>
  Toggle Section
</Button>
<Box id="section-content" hidden={!isOpen}>
  {/* content */}
</Box>
```

### Dialogs
```javascript
<Dialog
  open={open}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <DialogTitle id="dialog-title">Confirm Action</DialogTitle>
  <DialogContent id="dialog-description">
    Are you sure?
  </DialogContent>
</Dialog>
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Material-UI Accessibility Guide](https://mui.com/material-ui/guides/accessibility/)
- [WebAIM Resources](https://webaim.org/resources/)

## Compliance Checklist

- [x] Skip-to-content link implemented
- [x] Semantic landmarks defined (header, nav, main)
- [x] ARIA live regions for status updates
- [x] Focus management on route changes
- [x] Enhanced color contrast (WCAG AA)
- [x] Reduced motion support
- [x] Form labels properly associated
- [ ] All images have alt text (ongoing)
- [ ] All videos have captions (if applicable)
- [ ] All custom components keyboard accessible (ongoing)

## Future Enhancements

1. Add high contrast theme option
2. Implement font size adjustment controls
3. Add keyboard shortcut documentation
4. Create comprehensive screen reader testing guide
5. Implement ARIA live region for toast notifications
6. Add skip links for secondary navigation areas
7. Enhance table accessibility with proper headers and captions
