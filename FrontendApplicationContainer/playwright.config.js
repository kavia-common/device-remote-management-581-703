const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright E2E Test Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './e2e',
  
  /* Maximum time one test can run for */
  timeout: 30 * 1000,
  
  /* Test execution settings */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter configuration */
  reporter: [
    ['html', { outputFolder: 'e2e-report' }],
    ['json', { outputFile: 'e2e-results.json' }],
    ['list']
  ],
  
  /* Shared settings for all projects */
  use: {
    /* Base URL for navigation */
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    
    /* Collect trace on failure for debugging */
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',
    
    /* Navigation timeout */
    navigationTimeout: 15000,
    
    /* Action timeout */
    actionTimeout: 10000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI ? undefined : {
    command: 'npm start',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
