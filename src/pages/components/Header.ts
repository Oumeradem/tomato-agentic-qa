import { Locator, Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

/**
 * Top navigation header. Renders the "Sign In" button when signed out and a
 * "Profile" avatar (with an Orders/Logout menu) when signed in.
 */
export class Header extends BaseComponent {
  public constructor(page: Page) {
    super(page, page.locator('header, nav').first());
  }

  public get signInButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign In' });
  }

  public get profileAvatar(): Locator {
    return this.page.getByRole('img', { name: 'Profile' });
  }

  public get logoutItem(): Locator {
    return this.page.getByRole('listitem').filter({ hasText: 'Logout' });
  }

  public async isSignedIn(): Promise<boolean> {
    return this.profileAvatar.isVisible();
  }

  public async isSignedOut(): Promise<boolean> {
    return this.signInButton.isVisible();
  }

  /** Opens the profile menu and logs out, waiting for the header to reset. */
  public async logout(): Promise<void> {
    await this.profileAvatar.click();
    await this.logoutItem.click();
    await this.signInButton.waitFor({ state: 'visible' });
  }
}
