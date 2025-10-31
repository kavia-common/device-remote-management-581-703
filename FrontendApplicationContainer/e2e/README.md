# E2E Testing with Playwright

This directory contains end-to-end tests for the Device Remote Management platform using Playwright.

## Overview

The E2E test suite covers critical user flows including:
- **Login Flow**: Valid/invalid credentials, validation, error handling
- **Devices Search**: Debounce validation, filtering, no-results handling
- **Protocol Queries**: SNMP, WebPA, TR69, TR369 query execution
- **Realtime Updates**: SSE/WebSocket connection and status updates
- **Favorites**: Saving queries as favorites and managing them
- **Cancel Query**: Cancelling running queries and status verification

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Playwright browsers installed (automatic on first run)

## Installation

Playwright is already included in devDependencies. To install browsers:

```bash
npx playwright install chromium
```

For CI environments, install all required dependencies:

```bash
npx playwright install --with-deps chromium
```

## Running Tests

### Local Development

**Run all E2E tests (with UI):**
```bash
npm run e2e
```

**Run tests in headless mode:**
```bash
npm run e2e:headless
```

**Run specific test file:**
```bash
npx playwright test e2e/test_login.spec.js
```

**Run tests with UI mode (interactive debugging):**
```bash
npx playwright test --ui
```

**Run tests with headed browser (see browser actions):**
```bash
npx playwright test --headed
```

### CI Mode

**Run tests in CI environment:**
```bash
npm run e2e:ci
```

This command:
- Runs tests in headless mode
- Retries failed tests 2 times
- Records traces and videos on failure
- Uses single worker for stability
- Generates JSON and HTML reports

## Test Structure

```
e2e/
├── utils/
│   └── test-helpers.js          # Common utilities (auth, API mocking, SSE)
├── test_login.spec.js           # Login flow tests
├── test_devices_search.spec.js  # Device search with debounce
├── test_protocol_query.spec.js  # Protocol query execution
├── test_realtime_updates.spec.js # SSE/realtime updates
├── test_favorites.spec.js       # Favorites management
├── test_cancel_query.spec.js    # Query cancellation
└── README.md                    # This file
```

## Configuration

E2E test configuration is in `playwright.config.js` at the project root:

- **Base URL**: `http://localhost:3000` (configurable via `E2E_BASE_URL` env var)
- **Timeout**: 30 seconds per test
- **Retries**: 2 retries in CI, 0 in local development
- **Reporters**: HTML, JSON, and list reporters
- **Traces**: Recorded on failure in CI, on first retry locally
- **Videos**: Recorded on failure
- **Screenshots**: Captured on failure

## Test Helpers

The `utils/test-helpers.js` provides common utilities:

### `mockAuth(page, options)`
Mocks user authentication by setting tokens in localStorage.

```javascript
await mockAuth(page, { 
  role: 'admin', 
  tenantId: 'tenant-123' 
});
```

### `setupAPIMocks(page)`
Sets up API route mocking for backend endpoints (devices, queries, favorites).

```javascript
await setupAPIMocks(page);
```

### `setupRealtimeMock(page)`
Mocks EventSource for SSE realtime updates.

```javascript
await setupRealtimeMock(page);
```

### `sendQueryUpdate(page, data)`
Simulates SSE message for query status updates.

```javascript
await sendQueryUpdate(page, {
  type: 'query_status_update',
  queryId: 'query-123',
  status: 'completed'
});
```

### `waitForToast(page, expectedText)`
Waits for toast notification with specific text.

```javascript
await waitForToast(page, /query.*submitted/i);
```

## Writing New Tests

### Basic Test Structure

```javascript
const { test, expect } = require('@playwright/test');
const { mockAuth, setupAPIMocks } = require('./utils/test-helpers');

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await setupAPIMocks(page);
    await page.goto('/your-page');
  });

  test('should do something', async ({ page }) => {
    // Your test code
    await expect(page.getByText('Expected Text')).toBeVisible();
  });
});
```

### Best Practices

1. **Use semantic selectors**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Mock API responses**: Use `page.route()` for consistent, fast tests
3. **Wait appropriately**: Use `waitFor`, `waitForTimeout`, or expect assertions instead of fixed delays
4. **Test user flows**: Focus on end-to-end user journeys, not implementation details
5. **Keep tests isolated**: Each test should be independent and not rely on previous test state
6. **Use descriptive names**: Test names should clearly describe what is being tested

## Debugging Tests

### View Test Report

After running tests, view the HTML report:

```bash
npx playwright show-report e2e-report
```

### Debug Specific Test

```bash
npx playwright test test_login.spec.js --debug
```

### View Traces

Traces are automatically recorded on failure. To view:

```bash
npx playwright show-trace trace.zip
```

### VS Code Integration

Install the Playwright VS Code extension for:
- Running tests from editor
- Setting breakpoints
- Viewing test results inline

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Run E2E tests
        run: npm run e2e:ci
        env:
          CI: true
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: e2e-report/
```

### GitLab CI Example

```yaml
e2e-tests:
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  stage: test
  script:
    - npm ci
    - npx playwright install chromium
    - npm run e2e:ci
  artifacts:
    when: always
    paths:
      - e2e-report/
      - e2e-results.json
```

## Mock Server Alternative

If you prefer using a mock server instead of route mocking:

1. Install `msw` (Mock Service Worker):
```bash
npm install --save-dev msw
```

2. Create mock handlers in `e2e/mocks/handlers.js`
3. Start mock server before tests
4. Configure Playwright to use mock server URL

## Troubleshooting

### Tests fail with "Navigation timeout"
- Increase timeout in `playwright.config.js`
- Ensure development server is running
- Check `webServer` configuration

### "Browser not found" error
Run: `npx playwright install chromium`

### Tests pass locally but fail in CI
- Check environment variables
- Ensure `CI=true` is set
- Verify browser installation in CI
- Review trace files from CI artifacts

### Flaky tests
- Avoid fixed `waitForTimeout`, use `waitFor` with conditions
- Ensure proper API mocking
- Increase retries in CI
- Use `test.describe.serial` for dependent tests

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Debugging Guide](https://playwright.dev/docs/debug)

## Support

For issues or questions about E2E tests:
1. Check this README
2. Review Playwright documentation
3. Check test traces and reports
4. Contact the development team
