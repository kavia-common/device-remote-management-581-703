# Frontend Test Suite Documentation

Comprehensive testing documentation for the Device Remote Management Frontend application.

## Test Structure

```
src/
├── setupTests.js                           # Test configuration
├── components/
│   └── __tests__/
│       └── test_ProtectedRoute.js         # Component tests
└── store/
    └── slices/
        └── __tests__/
            ├── test_authSlice.js          # Auth reducer tests
            └── test_devicesSlice.js       # Devices reducer tests
```

## Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0

## Installation

Install dependencies:

```bash
npm install
```

## Test Stack

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers
- **@testing-library/user-event**: User interaction simulation

## Running Tests

### All Tests

Run all tests once:

```bash
npm test
```

### Watch Mode

Run tests in interactive watch mode:

```bash
npm run test:watch
```

### Coverage Report

Generate coverage report:

```bash
npm run test:coverage
```

Coverage report will be in `coverage/` directory.

### CI Mode

Run tests in non-interactive CI mode:

```bash
CI=true npm test
```

## Test Categories

### Redux Slice Tests

#### Auth Slice Tests (`test_authSlice.js`)

Tests for authentication state management:

- Initial state validation
- Login flow (pending, fulfilled, rejected)
- Registration flow
- Logout functionality
- Local storage integration
- Error handling
- Action creators

#### Devices Slice Tests (`test_devicesSlice.js`)

Tests for device state management:

- Initial state validation
- Fetch devices flow
- Device creation
- Device updates
- Device deletion
- Pagination handling
- Error states

### Component Tests

#### Protected Route Tests (`test_ProtectedRoute.js`)

Tests for route protection:

- Authenticated user access
- Unauthenticated user redirect
- Integration with Redux store

## Writing New Tests

### Redux Slice Test Example

```javascript
import myReducer, { myAction } from '../mySlice';

describe('mySlice', () => {
  it('should handle action', () => {
    const initialState = { value: 0 };
    const state = myReducer(initialState, myAction());
    
    expect(state.value).toBe(1);
  });
});
```

### Component Test Example

```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import MyComponent from '../MyComponent';
import { createMockStore } from '../../testUtils';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <MyComponent />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Async Test Example

```javascript
import { waitFor } from '@testing-library/react';

it('should handle async operation', async () => {
  render(<MyComponent />);
  
  // Wait for async operation
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### User Interaction Test Example

```javascript
import userEvent from '@testing-library/user-event';

it('should handle user interaction', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);
  
  const button = screen.getByRole('button', { name: 'Submit' });
  await user.click(button);
  
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

## Best Practices

1. **Test User Behavior**: Test what users see and do, not implementation details
2. **Accessibility**: Use accessible queries (getByRole, getByLabelText)
3. **Avoid Implementation Details**: Don't test internal state directly
4. **Mock API Calls**: Mock axios or use MSW for API mocking
5. **Clean Up**: Tests should not affect each other
6. **Descriptive Names**: Use clear test descriptions
7. **Arrange-Act-Assert**: Structure tests clearly

## Mocking

### Mock Redux Store

```javascript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  });
};
```

### Mock API Calls

```javascript
jest.mock('../../api/auth', () => ({
  login: jest.fn(() => Promise.resolve({
    user: { id: '1', email: 'test@test.com' },
    token: 'test-token'
  }))
}));
```

### Mock localStorage

```javascript
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock;
```

## Continuous Integration

### Example CI Configuration

```yaml
name: Frontend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Run tests
        run: CI=true npm test
        
      - name: Generate coverage
        run: npm run test:coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
```

## Debugging Tests

### Run Single Test File

```bash
npm test -- test_authSlice.js
```

### Run Tests Matching Pattern

```bash
npm test -- --testNamePattern="should login"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/react-scripts",
  "args": ["test", "--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Troubleshooting

### Tests Timing Out

Increase timeout in specific test:

```javascript
it('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Mock Not Working

Ensure mocks are at the top of the file:

```javascript
jest.mock('../../api/auth');

// Then import components
import MyComponent from '../MyComponent';
```

### Test Failing Randomly

Likely an async issue. Use `waitFor`:

```javascript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

## Coverage Thresholds

Current coverage thresholds (in package.json):

```json
"coverageThreshold": {
  "global": {
    "branches": 50,
    "functions": 50,
    "lines": 50,
    "statements": 50
  }
}
```

## Contributing

When adding new features:

1. Write tests alongside code
2. Maintain coverage above thresholds
3. Follow existing test patterns
4. Update this documentation
5. Run full test suite before committing

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
