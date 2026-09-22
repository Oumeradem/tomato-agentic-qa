import { World as CucumberWorld, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { setWorldConstructor, setDefaultTimeout } from '@cucumber/cucumber';
import { config, BrowserName } from '../config/config';
import { LoginPage } from '../pages/login/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';

/**
 * Raise the default per-step timeout well above Cucumber's 5s default.
 * Steps in this framework perform real UI automation (navigation, waits),
 * so a generous timeout avoids false failures on slower environments.
 * Overridable via STEP_TIMEOUT (ms).
 */
setDefaultTimeout(Number(process.env.STEP_TIMEOUT) || 60000);

/**
 * Custom Cucumber World.
 *
 * Holds the browser session and page objects for a single scenario. A fresh
 * World is created per scenario by Cucumber, which — combined with a fresh
 * BrowserContext created in the Before hook — guarantees test isolation.
 */
export class World extends CucumberWorld {
  public browser!: Browser;
  public context!: BrowserContext;
  public page!: Page;

  // Browser selection can be overridden per run via --world-parameters.
  public browserName: BrowserName;
  public headless: boolean;

  // Page objects are initialized in the Before hook.
  public loginPage!: LoginPage;
  public dashboardPage!: DashboardPage;

  // Captured console messages for the scenario (used for failure artifacts).
  public consoleLogs: string[] = [];

  constructor(options: IWorldOptions) {
    super(options);

    const params = (options.parameters ?? {}) as Record<string, unknown>;
    this.browserName = (params.browser as BrowserName) || config.browser;
    this.headless = params.headless !== undefined ? Boolean(params.headless) : config.headless;
  }
}

setWorldConstructor(World);
