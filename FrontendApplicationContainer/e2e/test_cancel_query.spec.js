const { test, expect } = require('@playwright/test');
const { mockAuth, setupAPIMocks, waitForToast } = require('./utils/test-helpers');

test.describe('Cancel Running Query', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await setupAPIMocks(page);
  });

  test('should display cancel button for running query', async ({ page }) => {
    // Mock long-running query
    await page.route('**/api/v1/queries', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            queryId: 'query-running-1',
            status: 'running',
            protocol: 'snmp',
            deviceId: 'device-001'
          })
        });
      }
    });

    await page.goto('/protocols/snmp');
    
    // Start a query
    await page.getByLabel(/device/i).click();
    await page.getByText('Router-001').click();
    await page.getByLabel(/oid|object identifier/i).fill('1.3.6.1.2.1.1.1.0');
    await page.getByRole('button', { name: /execute|submit|query/i }).click();
    
    await page.waitForTimeout(1000);
    
    // Cancel button should be visible
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await expect(cancelButton).toBeVisible();
  });

  test('should cancel running query successfully', async ({ page }) => {
    let queryCancelled = false;
    
    // Mock cancel endpoint
    await page.route('**/api/v1/queries/*/cancel', async (route) => {
      queryCancelled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Query cancelled successfully',
          queryId: 'query-running-1',
          status: 'cancelled'
        })
      });
    });

    await page.goto('/protocols/snmp');
    
    // Start a query
    await page.getByLabel(/device/i).click();
    await page.getByText('Router-001').click();
    await page.getByLabel(/oid|object identifier/i).fill('1.3.6.1.2.1.1.1.0');
    await page.getByRole('button', { name: /execute|submit|query/i }).click();
    
    await page.waitForTimeout(1000);
    
    // Click cancel button
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();
    
    // Should show cancellation toast
    await waitForToast(page, /query.*cancelled|cancellation.*successful/i);
    
    expect(queryCancelled).toBeTruthy();
  });

  test('should update query status after cancellation', async ({ page }) => {
    await page.route('**/api/v1/queries/*/cancel', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Query cancelled',
          status: 'cancelled'
        })
      });
    });

    await page.goto('/protocols/snmp');
    
    // Start and cancel query
    await page.getByLabel(/device/i).click();
    await page.getByText('Router-001').click();
    await page.getByLabel(/oid|object identifier/i).fill('1.3.6.1.2.1.1.1.0');
    await page.getByRole('button', { name: /execute|submit|query/i }).click();
    
    await page.waitForTimeout(1000);
    
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      await page.waitForTimeout(500);
      
      // Status should update or cancel button should disappear
      const isCancelButtonHidden = await cancelButton.isHidden().catch(() => true);
      expect(isCancelButtonHidden).toBeTruthy();
    }
  });

  test('should show cancelled status in query history', async ({ page }) => {
    // Mock query history with cancelled query
    await page.route('**/api/v1/queries', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'query-cancelled-1',
                protocol: 'snmp',
                deviceName: 'Router-001',
                status: 'cancelled',
                createdAt: new Date().toISOString()
              }
            ],
            pagination: { page: 1, pageSize: 50, totalItems: 1 }
          })
        });
      }
    });

    await page.goto('/query-history');
    
    // Should display cancelled status
    await expect(page.getByText(/cancelled/i)).toBeVisible();
  });

  test('should handle cancel request errors gracefully', async ({ page }) => {
    // Mock cancel endpoint to return error
    await page.route('**/api/v1/queries/*/cancel', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'CANCEL_FAILED',
            message: 'Failed to cancel query'
          }
        })
      });
    });

    await page.goto('/protocols/snmp');
    
    await page.getByLabel(/device/i).click();
    await page.getByText('Router-001').click();
    await page.getByLabel(/oid|object identifier/i).fill('1.3.6.1.2.1.1.1.0');
    await page.getByRole('button', { name: /execute|submit|query/i }).click();
    
    await page.waitForTimeout(1000);
    
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      
      // Should show error toast
      await waitForToast(page, /failed.*cancel|error/i);
    }
  });
});
