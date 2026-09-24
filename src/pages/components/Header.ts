import { Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

/**
 * The Tomato Food Delivery header (`.navbar`), present on every page.
 * Contains the logo, primary navigation links, the cart link (`/cart`), and
 * the "Sign In" button that opens the login modal. Cart state is client-side,
 * so navigation to the cart must go through this link (SPA), not a hard reload.
 */
export class Header extends BaseComponent {
  public readonly cartLink: Locator = this.page.getByRole('link', { name: 'Cart' });
  public readonly signInButton: Locator = this.page.getByRole('button', { name: 'Sign In' });

  public constructor(page: Header['page']) {
    super(page, page.locator('.navbar'));
  }

  public async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  public async openSignIn(): Promise<void> {
    await this.signInButton.click();
  }
}
