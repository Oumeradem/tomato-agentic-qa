import { Page } from '@playwright/test';

/**
 * Central composition point for every page object a scenario can use.
 *
 * Page objects are wired together once per scenario against a fresh page
 * (dependency injection / fixture). `CustomWorld.initPageObjects()` builds them
 * in the `Before` hook (see src/support/world.ts).
 *
 * As the project grows, import your pages and components here and add them to
 * the interface, e.g.:
 *
 *   import { HomePage } from '../pages/HomePage';
 *   import { Header } from '../pages/components/Header';
 *
 *   export interface PageObjects {
 *     readonly header: Header;
 *     readonly homePage: HomePage;
 *   }
 *
 *   export function createPageObjects(page: Page): PageObjects {
 *     const header = new Header(page);
 *     return { header, homePage: new HomePage(page, header) };
 *   }
 */
import { LoginPage } from '../pages/LoginPage';
import { Header } from '../pages/components/Header';
import { SignUpModal } from '../pages/components/SignUpModal';
import { MenuPage } from '../pages/MenuPage';
import { CartPage } from '../pages/CartPage';
import { OrderPage } from '../pages/OrderPage';

export interface PageObjects {
  readonly header: Header;
  readonly loginPage: LoginPage;
  readonly signUpModal: SignUpModal;
  readonly menuPage: MenuPage;
  readonly cartPage: CartPage;
  readonly orderPage: OrderPage;
}

/** Composes the page objects for a fresh page (dependency injection / fixture). */
export function createPageObjects(page: Page): PageObjects {
  const header = new Header(page);
  return {
    header,
    loginPage: new LoginPage(page, header),
    signUpModal: new SignUpModal(page),
    menuPage: new MenuPage(page),
    cartPage: new CartPage(page),
    orderPage: new OrderPage(page),
  };
}
