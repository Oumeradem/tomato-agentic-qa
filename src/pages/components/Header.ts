import { Locator, Page } from '@playwright/test';

/**
 * Example reusable header component.
 *
 * Components encapsulate a portion of the UI (e.g. a header, navigation bar
 * or modal) and are composed into pages. This keeps page objects small.
 */
export class Header {
  private readonly page: Page;
  private readonly userMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userMenu = page.getByTestId('user-menu');
  }

  async openUserMenu(): Promise<void> {
    await this.userMenu.click();
  }

  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.page.getByRole('menuitem', { name: 'Logout' }).click();
  }
}
