# E2E Testing Quick Reference

## Quick Start

```bash
# Install Playwright browsers (first time only)
npx playwright install chromium

# Run all E2E tests
npm run e2e

# Run tests in UI mode (interactive)
npm run e2e:ui

# Run tests in CI mode
npm run e2e:ci

# View test report
npm run e2e:report
```

## Test Coverage

✅ **Login Flow** - Authentication with valid/invalid credentials  
✅ **Device Search** - Debounced search with filtering  
✅ **Protocol Queries** - SNMP, WebPA, TR69, TR369 execution  
✅ **Realtime Updates** - SSE connection and status updates  
✅ **Favorites** - Save/remove queries as favorites  
✅ **Cancel Query** - Cancel running queries with status verification  

## Writing Tests

```javascript
const { test, expect } = require('@playwright/test');
const { mockAuth, setupAPIMocks } = require('./utils/test-helpers');

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await setupAPIMocks(page);
    await page.goto('/my-page');
  });

  test('should do something', async ({ page }) => {
    await page.getByLabel('Input').fill('value');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

## Common Commands

| Command | Description |
|---------|-------------|
| `npx playwright test` | Run all tests |
| `npx playwright test --headed` | Run with visible browser |
| `npx playwright test --ui` | Interactive UI mode |
| `npx playwright test --debug` | Debug mode with inspector |
| `npx playwright test file.spec.js` | Run specific file |
| `npx playwright test --grep "text"` | Run tests matching pattern |
| `npx playwright show-report` | View HTML report |

## Helper Functions

### mockAuth(page, options)
Mock user authentication
```javascript
await mockAuth(page, { role: 'admin', tenantId: 'tenant-123' });
```

### setupAPIMocks(page)
Setup backend API mocks
```javascript
await setupAPIMocks(page);
```

### waitForToast(page, text)
Wait for toast notification
```javascript
await waitForToast(page, /success/i);
```

### setupRealtimeMock(page)
Mock SSE/EventSource
```javascript
await setupRealtimeMock(page);
await sendQueryUpdate(page, { queryId: '123', status: 'completed' });
```

## Selectors (Priority Order)

1. **getByRole** - `getByRole('button', { name: 'Submit' })`
2. **getByLabel** - `getByLabel('Email')`
3. **getByPlaceholder** - `getByPlaceholder('Search...')`
4. **getByText** - `getByText('Welcome')`
5. **getByTestId** - `getByTestId('custom-element')` (use sparingly)

## Debugging

```bash
# Run with debug inspector
npx playwright test --debug

# Generate trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip

# Run one test in debug mode
npx playwright test test_login.spec.js:57 --debug
```

## CI Configuration

Set environment variable: `CI=true`

Tests will automatically:
- Run in headless mode
- Retry failures 2 times
- Record traces on failure
- Record videos on failure
- Use single worker for stability

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Browser not found" | Run `npx playwright install chromium` |
| Navigation timeout | Increase timeout in config or use `{ timeout: 60000 }` |
| Flaky tests | Use `waitFor` instead of `waitForTimeout` |
| Tests pass locally, fail in CI | Check CI environment variables and browser installation |

## Best Practices

✅ Use semantic selectors (getByRole, getByLabel)  
✅ Mock API responses for fast, reliable tests  
✅ Test user flows, not implementation details  
✅ Keep tests isolated and independent  
✅ Use descriptive test names  
✅ Wait for conditions, not fixed timeouts  
✅ Handle async operations properly  

## Resources

- Full Documentation: `e2e/README.md`
- Playwright Docs: https://playwright.dev/
- Test Helpers: `e2e/utils/test-helpers.js`
