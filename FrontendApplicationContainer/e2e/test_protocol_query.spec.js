const { test, expect } = require('@playwright/test');
const { mockAuth, setupAPIMocks, waitForToast } = require('./utils/test-helpers');

test.describe('Protocol Query Execution', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await setupAPIMocks(page);
  });

  test('should execute SNMP query successfully', async ({ page }) => {
    await page.goto('/protocols/snmp');
    
    // Fill SNMP query form
    await page.getByLabel(/device/i).click();
    await page.getByText('Router-001').click();
    
    await page.getByLabel(/oid|object identifier/i).fill('1.3.6.1.2.1.1.1.0');
    
    // Select SNMP version
    const versionSelect = page.locator('select, [role="combobox"]').filter({ hasText: /version/i }).first();
    if (await versionSelect.count() > 0) {
      await versionSelect.selectOption('v2c');
    }
    
    // Submit query
    await page.getByRole('button', { name: /execute|submit|query/i }).click();
    
    // Should show success message
    await waitForToast(page, /query.*submitted|query.*started/i);
  });

  test('should execute WebPA query successfully', async ({ page }) => {
    await page.goto('/protocols/webpa');
    
    // Fill WebPA query form
    await page.getByLabel(/device/i).click();
    await page.getByText('Router-001').click();
    
    await page.getByLabel(/parameter|path/i).fill('Device.WiFi.SSID.1.SSID');
    
    // Submit query
    await page.getByRole('button', { name: /execute|submit|query/i }).click();
    
    // Should show success message
    await waitForToast(page, /query.*submitted|query.*started/i);
  });

  test('should execute TR69 query successfully', async ({ page }) => {
    await page.goto('/protocols/tr69');
    
    // Fill TR69 query form
    await page.getByLabel(/device/i).click();
    await page.getByText('Router-001').click();
    
    await page.getByLabel(/parameter|path/i).fill('InternetGatewayDevice.DeviceInfo.ModelName');
    
    // Submit query
    await page.getByRole('button', { name: /execute|submit|query/i }).click();
    
    // Should show success message
    await waitForToast(page, /query.*submitted|query.*started/i);
  });

  test('should execute TR369/USP query successfully', async ({ page }) => {
    await page.goto('/protocols/tr369');
    
    // Fill TR369 query form
    await page.getByLabel(/device/i).click();
    await page.getByText('Router-001').click();
    
    await page.getByLabel(/parameter|path/i).fill('Device.LocalAgent.SoftwareVersion');
    
    // Submit query
    await page.getByRole('button', { name: /execute|submit|query/i }).click();
    
    // Should show success message
    await waitForToast(page, /query.*submitted|query.*started/i);
  });

  test('should show validation errors for incomplete form', async ({ page }) => {
    await page.goto('/protocols/snmp');
    
    // Try to submit without filling required fields
    await page.getByRole('button', { name: /execute|submit|query/i }).click();
    
    // Should show validation errors
    await expect(page.locator('text=/required|select.*device/i')).toBeVisible();
  });

  test('should disable submit button while query is in progress', async ({ page }) => {
    // Delay the API response
    await page.route('**/api/v1/queries', async (route) => {
      await page.waitForTimeout(2000);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          queryId: 'query-123',
          status: 'pending'
        })
      });
    });

    await page.goto('/protocols/snmp');
    
    await page.getByLabel(/device/i).click();
    await page.getByText('Router-001').click();
    await page.getByLabel(/oid|object identifier/i).fill('1.3.6.1.2.1.1.1.0');
    
    const submitButton = page.getByRole('button', { name: /execute|submit|query/i });
    await submitButton.click();
    
    // Button should be disabled during submission
    await expect(submitButton).toBeDisabled();
  });
});
