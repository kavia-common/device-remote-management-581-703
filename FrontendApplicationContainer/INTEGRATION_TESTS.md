# Integration Tests Documentation

## Overview

This document describes the integration tests implemented for the Device Remote Management frontend application. These tests verify the interaction between multiple components, Redux store, routing, and user interactions.

## Test Structure

All integration tests are located in `src/__tests__/integration/` directory:

```
src/__tests__/integration/
├── test_protectedRoutes.js    - Protected route authorization tests
├── test_favorites.js           - Favorites management flow tests
├── test_cancelQuery.js         - Query cancellation with toast tests
└── test_notifications.js       - Toast notification behavior tests
```

## Test Setup

### Mock Configuration

The `setupTests.js` file includes mocks for:

- **EventSource**: Mocked for deterministic realtime connection testing
- **WebSocket**: Mocked to prevent actual network connections during tests
- **IntersectionObserver**: Mocked for component visibility detection
- **window.matchMedia**: Mocked for responsive design testing

### Key Features

- Non-interactive test execution with `CI=true`
- Isolated test environment with mocked APIs
- Fast execution with no external dependencies
- Deterministic results using fake timers

## Test Suites

### 1. Protected Routes Integration Tests

**File**: `test_protectedRoutes.js`

**Coverage**:
- ✅ Authentication checks (redirect to login when unauthenticated)
- ✅ Authenticated user access to protected content
- ✅ Custom redirect paths
- ✅ Role-based access control (RBAC)
  - Single role requirement (any role)
  - Multiple roles requirement (all roles)
- ✅ Permission-based access control
  - Single permission requirement (any permission)
  - Multiple permissions requirement (all permissions)
- ✅ Combined role and permission checks
- ✅ Custom fallback rendering
- ✅ Edge cases (empty roles/permissions arrays)

**Test Count**: 18 tests

**Key Assertions**:
```javascript
// Redirect unauthenticated users
expect(screen.getByText('Login Page')).toBeInTheDocument();

// Allow authenticated users with correct roles
expect(screen.getByText('Protected Content')).toBeInTheDocument();

// Show custom fallback for unauthorized users
expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
```

### 2. Favorites Flow Integration Tests

**File**: `test_favorites.js`

**Coverage**:
- ✅ Fetch favorites list with pagination
- ✅ Create new favorite queries
- ✅ Delete favorites
- ✅ Star query from history
- ✅ Unstar query
- ✅ Filter favorites by name and protocol
- ✅ Permission-based access (read/write permissions)
- ✅ UI interactions (load, delete via buttons)
- ✅ Error handling for API failures

**Test Count**: 21 tests

**Key Assertions**:
```javascript
// Fetch and store favorites
expect(state.queries.favorites).toEqual(mockFavorites);

// Create favorite updates state
expect(state.queries.favorites).toContainEqual(createdFavorite);

// Delete removes from state
expect(state.queries.favorites).toHaveLength(1);

// Star creates mapping
expect(state.queries.favoritesByJobId[jobId]).toBe('fav-789');
```

### 3. Cancel Query Flow Integration Tests

**File**: `test_cancelQuery.js`

**Coverage**:
- ✅ Cancel button visibility for in-flight queries (pending, processing, running)
- ✅ Cancel button hidden for completed/cancelled/error queries
- ✅ Cancel button disabled while cancellation in progress
- ✅ Successful query cancellation dispatch
- ✅ Cancel query state transitions
- ✅ History updates on cancellation
- ✅ Success toast on successful cancellation
- ✅ Error toast on cancellation failure
- ✅ Multiple independent query cancellations
- ✅ Preserving query data after cancellation

**Test Count**: 16 tests

**Key Assertions**:
```javascript
// Button visibility
const canCancel = selectCanCancelQuery(jobId)(store.getState());
expect(canCancel).toBe(true);

// State transition
expect(state.queries.activeQueries[jobId].status).toBe('cancelled');

// Toast display
expect(screen.getByText(/Query cancelled successfully/i)).toBeInTheDocument();
```

### 4. Notifications Integration Tests

**File**: `test_notifications.js`

**Coverage**:
- ✅ Display success, error, warning, and info toasts
- ✅ Auto-dismiss after default duration (3000ms)
- ✅ Persistent toasts (duration: 0)
- ✅ Manual toast dismissal via close button
- ✅ Multiple toasts displayed simultaneously
- ✅ MaxToasts limit respected
- ✅ Toast dismissal order with auto-dismiss
- ✅ Toast provider renders children correctly
- ✅ ARIA attributes for accessibility
- ✅ Toast ID generation
- ✅ Integration with query operations

**Test Count**: 16 tests

**Key Assertions**:
```javascript
// Toast display
expect(screen.getByText('Success message')).toBeInTheDocument();

// Auto-dismiss
await waitFor(() => {
  expect(screen.queryByText('Success message')).not.toBeInTheDocument();
});

// Accessibility
expect(toastContainer).toHaveAttribute('aria-live', 'polite');
```

## Running Tests

### Run All Integration Tests

```bash
cd FrontendApplicationContainer
npm test -- src/__tests__/integration/ --watchAll=false
```

### Run Specific Test Suite

```bash
# Protected routes only
npm test -- test_protectedRoutes.js --watchAll=false

# Favorites only
npm test -- test_favorites.js --watchAll=false

# Cancel query only
npm test -- test_cancelQuery.js --watchAll=false

# Notifications only
npm test -- test_notifications.js --watchAll=false
```

### Run with Coverage

```bash
npm test -- src/__tests__/integration/ --coverage --watchAll=false
```

### Run in Watch Mode (Development)

```bash
npm test -- src/__tests__/integration/
```

## Test Results Summary

**Total Test Suites**: 4  
**Total Tests**: 71  
**Status**: ✅ All Passing  

### Breakdown by Suite:

| Suite | Tests | Status |
|-------|-------|--------|
| Protected Routes | 18 | ✅ Pass |
| Favorites | 21 | ✅ Pass |
| Cancel Query | 16 | ✅ Pass |
| Notifications | 16 | ✅ Pass |

## Best Practices

### 1. Test Isolation

Each test creates its own Redux store and component instances:

```javascript
const store = createMockStore({
  queries: { /* initial state */ },
  auth: { /* initial state */ },
});
```

### 2. Async Testing

Always use `waitFor` for asynchronous assertions:

```javascript
await waitFor(() => {
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

### 3. Mock API Calls

All API calls are mocked to prevent network requests:

```javascript
jest.mock('../../api/protocols');
protocolsApi.cancelQuery.mockResolvedValue({ success: true });
```

### 4. Timer Management

Use fake timers for predictable timing:

```javascript
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});
```

### 5. Act Wrapping

Wrap state updates in `act()`:

```javascript
act(() => {
  fireEvent.click(button);
});
```

## Known Issues and Warnings

### 1. Redux Store Warnings

**Warning**: "No reducer provided for key 'queries'"

**Cause**: The main app store exports `queries` reducer, but test files create isolated stores. This warning appears during import of shared modules.

**Impact**: No functional impact - tests use their own store configuration.

**Status**: Expected behavior - can be safely ignored in test context.

### 2. React Router Future Flags

**Warning**: React Router v7 will wrap state updates in `React.startTransition`

**Impact**: Informational only - no current impact.

**Action**: Update when migrating to React Router v7.

## Adding New Integration Tests

### Template Structure

```javascript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Import reducers and components
import yourReducer from '../../store/slices/yourSlice';

// Mock external dependencies
jest.mock('../../api/yourApi');

// Create mock store helper
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: { your: yourReducer },
    preloadedState: { your: { ...initialState.your } },
  });
};

describe('Your Feature Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Feature Area', () => {
    it('should test specific behavior', async () => {
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <YourComponent />
        </Provider>
      );

      // Interact
      fireEvent.click(screen.getByText('Button'));

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Expected Result')).toBeInTheDocument();
      });
    });
  });
});
```

## Continuous Integration

These tests are designed to run in CI environments:

- Non-interactive execution
- No external dependencies
- Fast execution (< 2 seconds)
- Deterministic results
- Clear failure messages

### CI Command

```bash
CI=true npm test -- src/__tests__/integration/ --watchAll=false --coverage
```

## Maintenance

### When to Update Tests

- **Component Changes**: Update tests when component behavior changes
- **State Shape Changes**: Update mock store when Redux state structure changes
- **API Changes**: Update mocked API responses when endpoints change
- **New Features**: Add new test suites for new integration scenarios

### Test Stability

All tests are designed to be:
- **Deterministic**: Same input always produces same output
- **Fast**: Complete in under 2 seconds
- **Isolated**: No shared state between tests
- **Maintainable**: Clear naming and structure

## Troubleshooting

### Test Timeout

If tests timeout, increase Jest timeout:

```javascript
jest.setTimeout(10000); // 10 seconds
```

### State Not Updating

Ensure state updates are wrapped in `act()`:

```javascript
act(() => {
  store.dispatch(yourAction());
});
```

### Element Not Found

Use `waitFor` for async rendering:

```javascript
await waitFor(() => {
  expect(screen.getByText('Text')).toBeInTheDocument();
});
```

### Mock Not Working

Verify mock is set up before test runs:

```javascript
beforeEach(() => {
  yourApi.method.mockResolvedValue({ data: {} });
});
```

## Related Documentation

- [TEST_README.md](./TEST_README.md) - General testing documentation
- [RBAC_GUIDE.md](./RBAC_GUIDE.md) - Role-based access control details
- [TOAST_IMPLEMENTATION_SUMMARY.md](./TOAST_IMPLEMENTATION_SUMMARY.md) - Toast notification system

## Conclusion

These integration tests provide comprehensive coverage of key user flows:
- Authentication and authorization
- Favorites management
- Query cancellation
- Notification system

All tests are fast, deterministic, and maintainable, ensuring reliable verification of application behavior.
