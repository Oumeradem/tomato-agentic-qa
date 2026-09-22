import { After, AfterAll, Before, BeforeAll, Status } from '@cucumber/cucumber';
import { Browser } from '@playwright/test';
import { World } from '../support/world';
import { launchBrowser, createContext } from '../support/browser';
import { config } from '../config/config';
import { captureFailureArtifacts, ScenarioInfo } from '../utils/artifacts';
import { writeEnvironmentInfo } from '../utils/reporter';
import { logger } from '../utils/logger';
import { LoginPage } from '../pages/login/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';

let browser: Browser | undefined;

BeforeAll(async function (): Promise<void> {
  writeEnvironmentInfo();
  browser = await launchBrowser();
});

/**
 * Before each scenario:
 *  - create a fresh, isolated BrowserContext (no shared cookies/storage)
 *  - create a page
 *  - initialize page objects
 *  - attach console listener for failure artifacts
 */
Before(async function (this: World, scenario: ScenarioInfo): Promise<void> {
  logger.info(`Starting scenario: ${scenario.pickle?.name}`);

  if (!browser) {
    throw new Error('Browser was not initialized in BeforeAll.');
  }
  this.context = await createContext(browser);

  if (config.artifacts.trace !== 'off') {
    await this.context.tracing.start({ screenshots: true, snapshots: true });
  }

  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(config.timeout.action);
  this.page.setDefaultNavigationTimeout(config.timeout.navigation);

  // Capture console messages (excluding secrets) for debugging.
  this.consoleLogs = [];
  this.page.on('console', (msg) => {
    const text = msg.text();
    if (!/pass(word)?|token|cookie|authorization/i.test(text)) {
      this.consoleLogs.push(`[${msg.type()}] ${text}`);
    }
  });

  this.loginPage = new LoginPage(this.page);
  this.dashboardPage = new DashboardPage(this.page);
});

/**
 * After each scenario:
 *  - capture failure artifacts if the scenario failed
 *  - close the page and context to release resources and guarantee isolation
 */
After(async function (this: World, scenario: ScenarioInfo): Promise<void> {
  const status = scenario.result?.status;
  if (status === Status.FAILED) {
    await captureFailureArtifacts(this, scenario);
  }

  if (this.page) {
    await this.page.close().catch(() => undefined);
  }
  if (this.context) {
    await this.context.close().catch(() => undefined);
  }
});

AfterAll(async function (): Promise<void> {
  if (browser) {
    await browser.close().catch(() => undefined);
  }
});
