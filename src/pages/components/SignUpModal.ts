import { Locator, Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export interface RegistrationDetails {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

/**
 * The "Sign Up" modal, reached from the Login modal via "Create a new account?".
 */
export class SignUpModal extends BaseComponent {
  public constructor(page: Page) {
    super(page, page.locator('form').first());
  }

  public get signUpHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Sign Up' });
  }

  public get nameField(): Locator {
    return this.page.getByRole('textbox', { name: 'Your name' });
  }

  public get emailField(): Locator {
    return this.page.getByRole('textbox', { name: 'Your email' });
  }

  public get passwordField(): Locator {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  public get createAccountButton(): Locator {
    return this.page.getByRole('button', { name: 'Create account' });
  }

  public get termsCheckbox(): Locator {
    return this.page.getByRole('checkbox');
  }

  public async isOpen(): Promise<boolean> {
    return this.signUpHeading.isVisible();
  }

  /** Fills the form, accepts the terms, and submits. Waits for the modal to close. */
  public async register(details: RegistrationDetails): Promise<void> {
    await this.nameField.fill(details.name);
    await this.emailField.fill(details.email);
    await this.passwordField.fill(details.password);
    if (!(await this.termsCheckbox.isChecked())) {
      await this.termsCheckbox.check();
    }
    await this.createAccountButton.click();
    await this.signUpHeading.waitFor({ state: 'hidden' });
  }
}
