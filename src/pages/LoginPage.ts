import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { config } from '../config/config';

/**
 * The Tomato Food Delivery sign-in modal.
 *
 * Sign-in is a modal (`.login-popup`) opened from the header's "Sign In"
 * button - the app has no dedicated /login page. The modal has an h2 "Login"
 * title, an email field exposed only by its placeholder "Your email", a
 * password field exposed by its placeholder "Password", and a "Login" submit
 * button. There are no labels and no data-testid attributes.
 *
 * Invalid credentials: the backend returns HTTP 200 with
 * `{"success":false,"message":"User Doesn't exist"}` and the app surfaces the
 * message via a native browser alert, not an in-page error element.
 */
export class LoginPage extends BasePage {
  public readonly signInButton: Locator = this.page.getByRole('button', { name: 'Sign In' });
  public readonly modalHeading: Locator = this.page.getByRole('heading', { name: 'Login' });
  public readonly emailInput: Locator = this.page.getByRole('textbox', { name: 'Your email' });
  public readonly passwordInput: Locator = this.page.getByRole('textbox', { name: 'Password' });
  public readonly loginButton: Locator = this.page.getByRole('button', { name: 'Login' });

  private dialogMessagePromise: Promise<string> | undefined;

  private static readonly BASE_PATH = '/';

  public async open(): Promise<void> {
    await this.goto(LoginPage.BASE_PATH);
    await this.waitForReady();
  }

  /** Opens the sign-in modal from the header; no-op when it is already open. */
  public async openSignInModal(): Promise<void> {
    if (!(await this.modalHeading.isVisible().catch(() => false))) {
      await this.signInButton.click();
      await this.modalHeading.waitFor({ state: 'visible' });
    }
  }

  public async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  public async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  public async submit(): Promise<void> {
    // Invalid credentials are reported through a browser alert. Listen for it
    // so the message can be asserted without arbitrary waits. Valid logins and
    // native required-field validation never raise a dialog, so the promise
    // simply stays unresolved in those cases.
    this.dialogMessagePromise = new Promise<string>((resolve) => {
      this.page.once('dialog', async (dialog) => {
        const message = dialog.message();
        await dialog.accept();
        resolve(message);
      });
    });
    await this.loginButton.click();
  }

  /**
   * Fills both credentials and submits the form through the UI.
   * The only programmatic flow allowed here - do not bypass the UI.
   */
  public async login(username: string, password: string): Promise<void> {
    await this.openSignInModal();
    await this.fillEmail(username);
    await this.fillPassword(password);
    await this.submit();
  }

  /** Signs in with the credentials from the environment (`.env` USERNAME / PASSWORD). */
  public async loginWithConfiguredCredentials(): Promise<void> {
    await this.login(config.username, config.password);
  }

  /**
   * Returns the message of the browser alert raised by the last submit
   * ('' when no alert arrived within the configured timeout).
   */
  public async getLoginErrorMessage(): Promise<string> {
    if (!this.dialogMessagePromise) return '';
    const message = await Promise.race([
      this.dialogMessagePromise,
      new Promise<string>((resolve) => setTimeout(() => resolve(''), config.timeout)),
    ]);
    this.dialogMessagePromise = undefined;
    return message;
  }
}
