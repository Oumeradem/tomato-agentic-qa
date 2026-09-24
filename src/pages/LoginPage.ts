import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Header } from './components/Header';

/**
 * The "Sign In" / Login modal on the home page.
 *
 * Live behavior notes:
 * - Email and password fields are `required`; the email field is `type=email`.
 * - The terms checkbox is `required`: an unchecked box blocks submit (no API call).
 * - Backend errors surface as native alert() dialogs (e.g. "User Doesn't exist",
 *   "Invalid credentials").
 */
export class LoginPage extends BasePage {
  public readonly header: Header;

  private loginRequestCount = 0;

  public constructor(page: Page, header: Header) {
    super(page);
    this.header = header;
    this.page.on('request', (request) => {
      if (request.url().includes('/api/user/login')) {
        this.loginRequestCount += 1;
      }
    });
  }

  public get loginHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Login' });
  }

  public get emailField(): Locator {
    return this.page.getByRole('textbox', { name: 'Your email' });
  }

  public get passwordField(): Locator {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  public get loginButton(): Locator {
    return this.page.getByRole('button', { name: 'Login' });
  }

  public get termsCheckbox(): Locator {
    return this.page.getByRole('checkbox');
  }

  public get closeButton(): Locator {
    return this.page.getByRole('img', { name: 'Close' });
  }

  public get createAccountLink(): Locator {
    return this.page.getByText('Create a new account? Click');
  }

  /** Opens the Login modal from the header "Sign In" button. */
  public async open(): Promise<void> {
    await this.header.signInButton.click();
    await this.loginHeading.waitFor({ state: 'visible' });
  }

  public async isOpen(): Promise<boolean> {
    return this.loginHeading.isVisible();
  }

  public async fillEmail(email: string): Promise<void> {
    await this.emailField.fill(email);
  }

  public async fillPassword(password: string): Promise<void> {
    await this.passwordField.fill(password);
  }

  public async acceptTerms(): Promise<void> {
    if (!(await this.termsCheckbox.isChecked())) {
      await this.termsCheckbox.check();
    }
  }

  public async submit(): Promise<void> {
    await this.loginButton.click();
  }

  public async close(): Promise<void> {
    await this.closeButton.click();
    await this.loginHeading.waitFor({ state: 'hidden' });
  }

  public async goToSignUp(): Promise<void> {
    const signUpHeading = this.page.getByRole('heading', { name: 'Sign Up' });
    // The app's Login -> Sign Up toggle is intermittently missed on the first
    // click (observed live), so retry a bounded number of times.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await this.createAccountLink.click();
      try {
        await signUpHeading.waitFor({ state: 'visible', timeout: 2000 });
        return;
      } catch {
        // Toggle did not register on this attempt; click again.
      }
    }
    throw new Error('The Sign Up modal did not open after clicking "Create a new account"');
  }

  /** Native HTML5 validation message for the email field ('' when valid). */
  public async emailValidationMessage(): Promise<string> {
    return this.emailField.evaluate((input) => {
      // The tsconfig has no DOM lib, so access validationMessage via a narrow cast.
      const field = input as unknown as { validationMessage: string };
      return field.validationMessage;
    });
  }

  public async loginRequestsSent(): Promise<number> {
    return this.loginRequestCount;
  }

  /** Captures and accepts the next native alert() dialog, returning its message. */
  public async captureAlert(): Promise<string> {
    return new Promise<string>((resolve) => {
      this.page.once('dialog', async (dialog) => {
        const message = dialog.message();
        await dialog.accept();
        resolve(message);
      });
    });
  }
}
