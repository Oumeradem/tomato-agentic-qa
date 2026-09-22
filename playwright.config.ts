import { defineConfig } from '@playwright/test';
import { config } from './src/config/config';

/**
 * Playwright configuration.
 *
 * NOTE: This framework uses Cucumber (@cucumber/cucumber) as its primary
 * test runner. Browsers are launched from the custom World / hooks rather
 * than through @playwright/test. This file exists to keep a single source of
 * truth for browser/trace/artifact options and to support tooling that reads
 * playwright.config.ts.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'reports/playwright-report', open: 'never' }]],
  use: {
    baseURL: config.baseUrl,
    browserName: config.browser as 'chromium' | 'firefox' | 'webkit',
    headless: config.headless,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
    actionTimeout: config.timeout.action,
    navigationTimeout: config.timeout.navigation,
    locale: 'en-US',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
