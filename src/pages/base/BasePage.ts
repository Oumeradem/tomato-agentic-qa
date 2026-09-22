import { Locator, Page } from '@playwright/test';
import { config } from '../../config/config';

/**
 * Base page providing shared navigation and interaction helpers.
 *
 * Concrete pages should focus on their own locators and business actions,
 * delegating to these helpers instead of duplicating Playwright calls.
 */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Navigate to an absolute URL. */
  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /** Navigate to a path relative to the configured base URL. */
  async gotoPath(path: string): Promise<void> {
    await this.goto(`${config.baseUrl}${path}`);
  }

  /** Get the current page title. */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /** Get the current page URL. */
  getUrl(): string {
    return this.page.url();
  }

  protected async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  protected async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  protected async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }
}
