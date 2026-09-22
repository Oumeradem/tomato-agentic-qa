import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { config } from '../../config/config';
import { DashboardPage } from '../dashboard/DashboardPage';

/**
 * Login page.
 *
 * Locators follow the priority: getByRole, getByLabel, getByPlaceholder,
 * getByText, getByTestId, locator with stable attributes.
 */
export class LoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByTestId('login-error');
  }

  async open(): Promise<void> {
    await this.gotoPath('/login');
  }

  async login(username: string, password: string): Promise<DashboardPage> {
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
    return new DashboardPage(this.page);
  }

  async loginWithValidCredentials(): Promise<DashboardPage> {
    return this.login(config.credentials.username, config.credentials.password);
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) || '';
  }
}
