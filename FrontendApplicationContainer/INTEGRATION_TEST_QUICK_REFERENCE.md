# Integration Tests - Quick Reference

## Running Tests

```bash
# All integration tests
npm test -- src/__tests__/integration/ --watchAll=false

# Specific suite
npm test -- test_protectedRoutes.js --watchAll=false

# With coverage
npm test -- src/__tests__/integration/ --coverage --watchAll=false

# CI mode (non-interactive)
CI=true npm test -- src/__tests__/integration/ --watchAll=false

# Watch mode (development)
npm test -- src/__tests__/integration/
```

## Test Files Location

```
src/__tests__/integration/
├── test_protectedRoutes.js     # Auth & authorization (18 tests)
├── test_favorites.js            # Favorites CRUD (21 tests)
├── test_cancelQuery.js          # Query cancellation (16 tests)
└── test_notifications.js        # Toast notifications (18 tests)
```

## Quick Test Patterns

### Create Mock Store
```javascript
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: { queries: queriesReducer, auth: authReducer },
    preloadedState: {
      queries: { activeQueries: {}, ...initialState.queries },
      auth: { isAuthenticated: true, ...initialState.auth },
    },
  });
};
```

### Render with Store and Router
```javascript
const renderWithProviders = (component, store) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/protected']}>
        <ToastProvider>
          {component}
        </ToastProvider>
      </MemoryRouter>
    </Provider>
  );
};
```

### Test Async Actions
```javascript
it('should fetch data', async () => {
  api.fetch.mockResolvedValue({ data: mockData });
  
  await store.dispatch(fetchData());
  
  const state = store.getState();
  expect(state.data).toEqual(mockData);
});
```

### Test User Interactions
```javascript
it('should handle click', async () => {
  render(<Component />);
  
  act(() => {
    fireEvent.click(screen.getByText('Button'));
  });
  
  await waitFor(() => {
    expect(screen.getByText('Result')).toBeInTheDocument();
  });
});
```

### Test Toast Notifications
```javascript
it('should show toast', async () => {
  render(
    <ToastProvider>
      <Component />
    </ToastProvider>
  );
  
  act(() => {
    fireEvent.click(screen.getByText('Trigger'));
  });
  
  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

### Test with Fake Timers
```javascript
beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  act(() => jest.runOnlyPendingTimers());
  jest.useRealTimers();
});

it('should auto-dismiss', async () => {
  // ... render component
  
  act(() => {
    jest.advanceTimersByTime(3000);
  });
  
  await waitFor(() => {
    expect(screen.queryByText('Toast')).not.toBeInTheDocument();
  });
});
```

## Common Assertions

### Element Presence
```javascript
expect(screen.getByText('Text')).toBeInTheDocument();
expect(screen.queryByText('Text')).not.toBeInTheDocument();
```

### State Checks
```javascript
const state = store.getState();
expect(state.queries.favorites).toHaveLength(2);
expect(state.queries.activeQueries[jobId].status).toBe('cancelled');
```

### Navigation
```javascript
await waitFor(() => {
  expect(screen.getByText('Login Page')).toBeInTheDocument();
});
```

### Accessibility
```javascript
expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
expect(screen.getByRole('status')).toBeInTheDocument();
```

## Mock Setup Examples

### Mock API
```javascript
jest.mock('../../api/protocols');
protocolsApi.cancelQuery.mockResolvedValue({ success: true });
protocolsApi.snmpGet.mockRejectedValue({ message: 'Error' });
```

### Mock with Delay
```javascript
api.method.mockImplementation(() =>
  new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100))
);
```

## Troubleshooting

### Test Timeout
```javascript
jest.setTimeout(10000); // Increase to 10 seconds
```

### Act Warning
```javascript
// Wrap state updates
act(() => {
  fireEvent.click(button);
});
```

### Element Not Found
```javascript
// Use waitFor for async rendering
await waitFor(() => {
  expect(screen.getByText('Text')).toBeInTheDocument();
});
```

### Multiple Elements
```javascript
// Use getAllByText or more specific query
const buttons = screen.getAllByRole('button', { name: /submit/i });
expect(buttons).toHaveLength(2);
```

## Test Statistics

| Suite | Tests | Time |
|-------|-------|------|
| Protected Routes | 18 | ~0.6s |
| Favorites | 21 | ~0.7s |
| Cancel Query | 16 | ~0.5s |
| Notifications | 18 | ~0.6s |
| **Total** | **73** | **~2.4s** |

## Coverage Areas

- ✅ Authentication & Authorization
- ✅ Role-Based Access Control
- ✅ Permission-Based Access Control
- ✅ Favorites CRUD Operations
- ✅ Query Cancellation Flow
- ✅ Toast Notifications
- ✅ State Management
- ✅ API Integration
- ✅ User Interactions

## Best Practices

1. **Isolate Tests**: Each test gets fresh store and mocks
2. **Use act()**: Wrap state updates in act()
3. **Use waitFor()**: For async assertions
4. **Mock APIs**: All external calls mocked
5. **Fake Timers**: For deterministic timing
6. **Clear Mocks**: Reset between tests
7. **Descriptive Names**: Test names explain what's tested
8. **Single Assertion**: Focus each test on one behavior

## Resources

- [INTEGRATION_TESTS.md](./INTEGRATION_TESTS.md) - Full documentation
- [TEST_README.md](./TEST_README.md) - General testing guide
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Docs](https://jestjs.io/docs/getting-started)
