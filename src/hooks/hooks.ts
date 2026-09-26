import {
  After,
  AfterAll,
  Before,
  BeforeAll,
  ITestCaseHookParameter,
  Status,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import { Browser, BrowserContextOptions, chromium, firefox, webkit } from '@playwright/test';
import { config } from '../config/config';
import { CustomWorld } from '../support/world';
import { BrowserName } from '../types';
import {
  captureFailureArtifacts,
  capturePassScreenshot,
  saveOrDiscardVideo,
  videoRecordingsDir,
} from '../utils/artifact-manager';
import { logger } from '../utils/logger';

setDefaultTimeout(config.timeout);

const browserLaunchers: Record<BrowserName, typeof chromium> = {
  chromium,
  firefox,
  webkit,
};

let browser: Browser | undefined;

async function launchBrowser(): Promise<Browser> {
  const launcher = browserLaunchers[config.browser];
  if (!launcher) {
    throw new Error(`Unsupported browser "${config.browser}". Use one of: ${Object.keys(browserLaunchers).join(', ')}`);
  }
  logger.info('Launching browser', { browser: config.browser, headless: config.headless });
  return launcher.launch({ headless: config.headless });
}

BeforeAll(async (): Promise<void> => {
  // The Tomato app exposes no data-testid/data-test attributes; locators use
  // role, label, placeholder, and text. No global test-id attribute is set.
  browser = await launchBrowser();
  logger.info('Environment loaded', {
    env: config.env,
    baseUrl: config.baseUrl,
    workers: config.workers,
    retries: config.retries,
  });
});

Before(async function (this: CustomWorld, scenario: ITestCaseHookParameter): Promise<void> {
  const tags = scenario.pickle.tags.map((tag) => tag.name);
  this.scenario = { name: scenario.pickle.name, tags };
  this.consoleErrors = [];

  if (!browser) {
    throw new Error('Browser was not launched in BeforeAll');
  }

  const contextOptions: BrowserContextOptions = {
    baseURL: config.baseUrl,
    viewport: { width: 1280, height: 720 },
  };
  if (config.video !== 'off') {
    contextOptions.recordVideo = { dir: videoRecordingsDir(), size: { width: 1280, height: 720 } };
  }
  this.context = await browser.newContext(contextOptions);
  this.page = await this.context.newPage();

  if (config.trace !== 'off') {
    await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  }

  this.page.on('console', (message) => {
    if (message.type() === 'error') {
      this.consoleErrors.push(message.text());
    }
  });
  this.page.on('pageerror', (error) => {
    this.consoleErrors.push(`Page error: ${error.message}`);
  });

  this.initPageObjects();
  logger.info('Scenario started', { scenario: this.scenario.name, tags });
});

After(async function (this: CustomWorld, scenario: ITestCaseHookParameter): Promise<void> {
  const status = scenario.result?.status;
  const isFailed = status === Status.FAILED;
  const video = this.page.video();

  if (isFailed) {
    logger.error('Scenario failed', { scenario: this.scenario.name, error: scenario.result?.message });
    await captureFailureArtifacts(
      this,
      this.page,
      this.context,
      this.scenario.name,
      scenario.result?.message,
      this.consoleErrors,
    );
  } else if (config.screenshot === 'on') {
    await capturePassScreenshot(this, this.page, this.scenario.name);
  }

  if (this.context) {
    await this.context.close().catch((error: unknown) => {
      logger.warn('Failed to close browser context', { error: String(error) });
    });
  }

  // Finalize the recording (if any) now that the context is closed.
  await saveOrDiscardVideo(video, this.scenario.name, config.video, isFailed);

  logger.info('Scenario finished', { scenario: this.scenario.name, status });
});

AfterAll(async (): Promise<void> => {
  if (browser) {
    await browser.close();
    logger.info('Browser closed');
  }
});
