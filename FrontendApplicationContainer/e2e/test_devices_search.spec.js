const { test, expect } = require('@playwright/test');
const { mockAuth, setupAPIMocks } = require('./utils/test-helpers');

test.describe('Devices Search with Debounce', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await setupAPIMocks(page);
    await page.goto('/devices');
  });

  test('should display devices page with search input', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /devices/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search.*devices/i)).toBeVisible();
  });

  test('should debounce search input and not trigger immediate requests', async ({ page }) => {
    let requestCount = 0;
    
    // Track API requests
    page.on('request', (request) => {
      if (request.url().includes('/api/v1/devices') && request.url().includes('search=')) {
        requestCount++;
      }
    });

    const searchInput = page.getByPlaceholder(/search.*devices/i);
    
    // Type quickly (each character within 200ms)
    await searchInput.type('Router', { delay: 50 });
    
    // Wait a bit for debounce
    await page.waitForTimeout(500);
    
    // Should have made only 1 or 2 requests (not 6), proving debounce works
    expect(requestCount).toBeLessThan(4);
  });

  test('should search devices and display filtered results', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search.*devices/i);
    
    // Type search term
    await searchInput.fill('Router');
    
    // Wait for debounce and results
    await page.waitForTimeout(800);
    
    // Should display filtered device
    await expect(page.getByText('Router-001')).toBeVisible();
  });

  test('should show "no results" message for non-existent device', async ({ page }) => {
    // Override API mock for empty results
    await page.route('**/api/v1/devices*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          pagination: { page: 1, pageSize: 50, totalItems: 0 }
        })
      });
    });

    const searchInput = page.getByPlaceholder(/search.*devices/i);
    await searchInput.fill('NonExistentDevice999');
    
    // Wait for debounce and results
    await page.waitForTimeout(800);
    
    // Should show no results message
    await expect(page.locator('text=/no.*devices.*found|no.*results/i')).toBeVisible();
  });

  test('should clear search and show all devices', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search.*devices/i);
    
    // Search first
    await searchInput.fill('Router');
    await page.waitForTimeout(800);
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(800);
    
    // Should show all devices again
    await expect(page.getByText('Router-001')).toBeVisible();
    await expect(page.getByText('Switch-001')).toBeVisible();
  });
});
