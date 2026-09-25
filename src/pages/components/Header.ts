import { Locator, Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

/**
 * Top navigation header. Renders the "Sign In" button when signed out and a
 * "Profile" avatar (with an Orders/Logout menu) when signed in.
 */
export class Header extends BaseComponent {
  public constructor(page: Page) {
    // The app renders the top navigation as div.navbar (no <header>/<nav> tags).
    super(page, page.locator('div.navbar'));
  }

  public get signInButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign In' });
  }

  public get tomatoLogo(): Locator {
    return this.root.getByRole('img', { name: 'Tomato logo' });
  }

  public get homeTab(): Locator {
    return this.root.getByRole('link', { name: 'Home', exact: true });
  }

  public get menuTab(): Locator {
    return this.root.getByRole('link', { name: 'Menu' });
  }

  public get mobileAppTab(): Locator {
    return this.root.getByRole('link', { name: 'Mobile App' });
  }

  public get contactUsTab(): Locator {
    return this.root.getByRole('link', { name: 'Contact Us' });
  }

  /** The "Search" control (an image, no text label). */
  public get searchControl(): Locator {
    return this.root.getByRole('img', { name: 'Search' });
  }

  public get cartTab(): Locator {
    return this.root.getByRole('link', { name: 'Cart' });
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
