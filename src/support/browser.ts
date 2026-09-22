import { Browser, BrowserContext, BrowserType, chromium, firefox, webkit } from '@playwright/test';
import { config, BrowserName } from '../config/config';

/**
 * Browser lifecycle helpers.
 *
 * A single Browser instance is launched per worker (BeforeAll) and a fresh
 * BrowserContext is created per scenario to guarantee test isolation.
 */
function getBrowserType(name: BrowserName): BrowserType {
  switch (name) {
    case 'firefox':
      return firefox;
    case 'webkit':
      return webkit;
    case 'chromium':
    default:
      return chromium;
  }
}

export async function launchBrowser(browserName: BrowserName = config.browser): Promise<Browser> {
  const browserType = getBrowserType(browserName);
  return browserType.launch({
    headless: config.headless,
    // Args below keep chromium stable on CI/containers.
    args: browserName === 'chromium' ? ['--no-sandbox', '--disable-dev-shm-usage'] : undefined,
  });
}

/**
 * Creates an isolated BrowserContext with a clean storage state so scenarios
 * never share cookies or local storage.
 */
export async function createContext(browser: Browser): Promise<BrowserContext> {
  return browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
    acceptDownloads: true,
  });
}
