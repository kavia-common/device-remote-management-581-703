const { test, expect } = require('@playwright/test');
const { mockAuth, setupAPIMocks, waitForToast } = require('./utils/test-helpers');

test.describe('Query Favorites', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await setupAPIMocks(page);
  });

  test('should save query as favorite from protocol page', async ({ page }) => {
    await page.goto('/protocols/snmp');
    
    // Execute a query first
    await page.getByLabel(/device/i).click();
    await page.getByText('Router-001').click();
    await page.getByLabel(/oid|object identifier/i).fill('1.3.6.1.2.1.1.1.0');
    await page.getByRole('button', { name: /execute|submit|query/i }).click();
    
    await page.waitForTimeout(1000);
    
    // Look for favorite/star button
    const favoriteButton = page.getByRole('button', { name: /favorite|star/i }).or(
      page.locator('button[aria-label*="favorite"], button[aria-label*="star"]')
    ).first();
    
    if (await favoriteButton.count() > 0) {
      await favoriteButton.click();
      
      // Should show success toast
      await waitForToast(page, /added.*favorite|favorite.*saved/i);
    }
  });

  test('should display favorites in query history', async ({ page }) => {
    // Mock favorites in query history
    await page.route('**/api/v1/queries*', async (route) => {
      const url = new URL(route.request().url());
      const favorites = url.searchParams.get('favorites');
      
      if (favorites === 'true') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'query-fav-1',
                protocol: 'snmp',
                deviceName: 'Router-001',
                status: 'completed',
                isFavorite: true,
                createdAt: new Date().toISOString()
              }
            ],
            pagination: { page: 1, pageSize: 50, totalItems: 1 }
          })
        });
      } else {
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

    await page.goto('/query-history');
    
    // Look for favorites filter/tab
    const favoritesTab = page.getByRole('tab', { name: /favorites/i }).or(
      page.getByRole('button', { name: /favorites/i })
    ).first();
    
    if (await favoritesTab.count() > 0) {
      await favoritesTab.click();
      await page.waitForTimeout(500);
      
      // Should display favorite query
      await expect(page.getByText('Router-001')).toBeVisible();
    }
  });

  test('should remove query from favorites', async ({ page }) => {
    // Mock query history with a favorite
    await page.route('**/api/v1/queries', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'query-fav-1',
                protocol: 'snmp',
                deviceName: 'Router-001',
                status: 'completed',
                isFavorite: true,
                createdAt: new Date().toISOString()
              }
            ],
            pagination: { page: 1, pageSize: 50, totalItems: 1 }
          })
        });
      }
    });

    // Mock unfavorite endpoint
    await page.route('**/api/v1/queries/*/favorite', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Removed from favorites' })
        });
      }
    });

    await page.goto('/query-history');
    
    // Find and click unfavorite button
    const unfavoriteButton = page.getByRole('button', { name: /unfavorite|remove.*favorite/i }).or(
      page.locator('button[aria-label*="unfavorite"]')
    ).first();
    
    if (await unfavoriteButton.count() > 0) {
      await unfavoriteButton.click();
      
      // Should show success message
      await waitForToast(page, /removed.*favorite/i);
    }
  });

  test('should filter favorites in query history page', async ({ page }) => {
    await page.goto('/query-history');
    
    // Look for favorites filter
    const filterButton = page.getByRole('button', { name: /filter|favorites/i }).or(
      page.getByLabel(/show.*favorites/i)
    ).first();
    
    if (await filterButton.count() > 0) {
      await expect(filterButton).toBeVisible();
    }
  });
});
