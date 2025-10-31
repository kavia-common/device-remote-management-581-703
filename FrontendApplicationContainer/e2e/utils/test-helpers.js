/**
 * E2E Test Helper Utilities
 * Provides common functions for authentication, API mocking, and test setup
 */

/**
 * Mock authentication by setting tokens in localStorage
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Authentication options
 */
async function mockAuth(page, options = {}) {
  const defaultUser = {
    userId: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: options.role || 'user',
    tenantId: options.tenantId || 'tenant-001',
    permissions: options.permissions || ['devices:read', 'queries:execute', 'queries:read']
  };

  const token = 'mock-jwt-token-' + Date.now();
  
  await page.addInitScript(({ user, token }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, { user: defaultUser, token });
}

/**
 * Setup API route mocking for backend endpoints
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
async function setupAPIMocks(page) {
  // Mock devices endpoint
  await page.route('**/api/v1/devices*', async (route) => {
    const url = new URL(route.request().url());
    const search = url.searchParams.get('search') || '';
    
    const mockDevices = [
      { id: 'device-001', name: 'Router-001', type: 'router', ip: '192.168.1.1', status: 'online' },
      { id: 'device-002', name: 'Switch-001', type: 'switch', ip: '192.168.1.2', status: 'online' },
      { id: 'device-003', name: 'Modem-001', type: 'modem', ip: '192.168.1.3', status: 'offline' },
    ].filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: mockDevices,
        pagination: { page: 1, pageSize: 50, totalItems: mockDevices.length }
      })
    });
  });

  // Mock queries endpoint for starting queries
  await page.route('**/api/v1/queries', async (route) => {
    if (route.request().method() === 'POST') {
      const queryId = 'query-' + Date.now();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          queryId,
          status: 'pending',
          protocol: 'snmp',
          deviceId: 'device-001',
          createdAt: new Date().toISOString()
        })
      });
    } else {
      // GET queries (history)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          pagination: { page: 1, pageSize: 50, totalItems: 0 }
        })
      });
    }
  });

  // Mock query status endpoint
  await page.route('**/api/v1/queries/*', async (route) => {
    const method = route.request().method();
    
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          queryId: 'query-123',
          status: 'completed',
          protocol: 'snmp',
          result: { data: 'mock-result' }
        })
      });
    } else if (method === 'DELETE') {
      // Cancel query
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Query cancelled successfully' })
      });
    }
  });

  // Mock favorites endpoint
  await page.route('**/api/v1/queries/*/favorite', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Added to favorites' })
    });
  });

  // Mock tenants endpoint
  await page.route('**/api/v1/tenants', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          { id: 'tenant-001', name: 'Test Tenant' }
        ]
      })
    });
  });
}

/**
 * Wait for toast notification to appear
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} expectedText - Expected toast message text
 */
async function waitForToast(page, expectedText) {
  const toast = page.locator('[role="alert"], .MuiAlert-root, .toast-message').filter({ hasText: expectedText });
  await toast.waitFor({ state: 'visible', timeout: 5000 });
  return toast;
}

/**
 * Setup mock SSE/EventSource for realtime updates
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
async function setupRealtimeMock(page) {
  await page.addInitScript(() => {
    // Mock EventSource for SSE
    class MockEventSource {
      constructor(url) {
        this.url = url;
        this.readyState = 1; // OPEN
        this.onopen = null;
        this.onmessage = null;
        this.onerror = null;
        
        // Simulate connection opened
        setTimeout(() => {
          if (this.onopen) this.onopen({ type: 'open' });
        }, 100);
        
        // Store instance globally for test control
        window.__mockEventSource = this;
      }
      
      addEventListener(event, handler) {
        if (event === 'message') this.onmessage = handler;
        if (event === 'open') this.onopen = handler;
        if (event === 'error') this.onerror = handler;
      }
      
      close() {
        this.readyState = 2; // CLOSED
      }
    }
    
    window.EventSource = MockEventSource;
    
    // Helper function to simulate SSE message from test
    window.__sendSSEMessage = (data) => {
      if (window.__mockEventSource && window.__mockEventSource.onmessage) {
        window.__mockEventSource.onmessage({
          type: 'message',
          data: JSON.stringify(data)
        });
      }
    };
  });
}

/**
 * Simulate SSE message for query status update
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} updateData - Update data to send
 */
async function sendQueryUpdate(page, updateData) {
  await page.evaluate((data) => {
    if (window.__sendSSEMessage) {
      window.__sendSSEMessage(data);
    }
  }, updateData);
}

module.exports = {
  mockAuth,
  setupAPIMocks,
  waitForToast,
  setupRealtimeMock,
  sendQueryUpdate
};
