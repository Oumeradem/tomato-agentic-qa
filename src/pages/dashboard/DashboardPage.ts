import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { config } from '../../config/config';

/**
 * Dashboard page shown after a successful login.
 */
export class DashboardPage extends BasePage {
  private readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
  }

  /** Asserts the dashboard is loaded by waiting for its heading. */
  async isLoaded(): Promise<void> {
    await this.heading.waitFor({ state: 'visible', timeout: config.timeout.expect });
  }

  async getHeadingText(): Promise<string> {
    return (await this.heading.textContent()) || '';
  }
}
