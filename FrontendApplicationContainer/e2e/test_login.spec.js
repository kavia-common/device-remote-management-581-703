const { test, expect } = require('@playwright/test');

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup API mocks for login
    await page.route('**/api/v1/auth/login', async (route) => {
      const postData = route.request().postDataJSON();
      
      if (postData.email === 'valid@example.com' && postData.password === 'ValidPass123') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: 'mock-jwt-token',
            user: {
              id: 'user-123',
              email: 'valid@example.com',
              name: 'Valid User',
              role: 'user'
            }
          })
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid email or password',
              timestamp: new Date().toISOString()
            }
          })
        });
      }
    });

    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /login|sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login|sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: /login|sign in/i });
    await loginButton.click();
    
    // Check for validation messages
    const errorMessages = page.locator('text=/required|cannot be empty/i');
    await expect(errorMessages.first()).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill in valid credentials
    await page.getByLabel(/email/i).fill('valid@example.com');
    await page.getByLabel(/password/i).fill('ValidPass123');
    
    // Submit form
    await page.getByRole('button', { name: /login|sign in/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/(dashboard|devices|home)/i, { timeout: 10000 });
    
    // Check if user is logged in (token stored)
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('WrongPassword');
    
    // Submit form
    await page.getByRole('button', { name: /login|sign in/i }).click();
    
    // Should show error message
    await expect(page.locator('text=/invalid.*credentials|incorrect.*password/i')).toBeVisible({ timeout: 5000 });
    
    // Should still be on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Override route to simulate network error
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.abort('failed');
    });

    await page.getByLabel(/email/i).fill('valid@example.com');
    await page.getByLabel(/password/i).fill('ValidPass123');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    
    // Should show network error message
    await expect(page.locator('text=/network.*error|connection.*failed|try again/i')).toBeVisible({ timeout: 5000 });
  });
});
