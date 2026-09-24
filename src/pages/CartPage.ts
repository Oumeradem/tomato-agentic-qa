import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { config } from '../config/config';

/**
 * The Tomato cart page (/cart).
 *
 * Live app notes (verified against the deployed app):
 * - Each row (div.cart-items-title.cart-items-item) renders the dish image
 *   followed by paragraphs in a fixed order: name, price, quantity, line total,
 *   and the remove control (p.cross, an "x" that removes one unit at a time).
 * - The totals block (div.cart-total) has one div.cart-total-details row per
 *   value (Subtotal, Delivery Fee, Total); the value is the row's second child.
 * - The Delivery Fee is $2 when the cart is non-empty and $0 when empty.
 * - The promo "Submit" button gives no visible feedback for invalid codes and
 *   leaves the totals untouched.
 */
export class CartPage extends BasePage {
  public constructor(page: Page) {
    super(page);
  }

  /**
   * Opens the cart via the header cart link and waits for it to render.
   * When the page is not on the app yet (scenarios may start on about:blank),
   * loads the home page first; an already-loaded page keeps its SPA state
   * (a full reload would wipe the in-memory cart).
   */
  public async open(): Promise<void> {
    if (!this.page.url().startsWith(config.baseUrl)) {
      await this.goto(config.baseUrl);
    }
    await this.page.getByRole('link', { name: 'Cart' }).click();
    await this.cartTotalHeading.waitFor({ state: 'visible' });
  }

  public get cartTotalHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Cart Total', exact: true });
  }

  /** The totals block (div.cart-total) containing the value rows. */
  private get totalsBlock(): Locator {
    return this.cartTotalHeading.locator('..');
  }

  /** The cart row element for the given dish. */
  public row(dishName: string): Locator {
    // The dish image is a direct child of the row div.
    return this.page.getByRole('img', { name: dishName, exact: true }).locator('..');
  }

  /** Row paragraphs: 0 name, 1 price, 2 quantity, 3 line total, 4 remove. */
  public rowPrice(dishName: string): Locator {
    return this.row(dishName).locator('p').nth(1);
  }

  public rowQuantity(dishName: string): Locator {
    return this.row(dishName).locator('p').nth(2);
  }

  public rowLineTotal(dishName: string): Locator {
    return this.row(dishName).locator('p').nth(3);
  }

  /** The "x" remove control of a row (removes one unit at a time). */
  public removeOne(dishName: string): Locator {
    return this.row(dishName).locator('p.cross');
  }

  /** Every remove control on the page (one per cart row). */
  public get removeControls(): Locator {
    return this.page.locator('p.cross');
  }

  /** The value (second child) of a div.cart-total-details totals row. */
  private valueFor(label: string): Locator {
    const row = this.totalsBlock
      .locator('.cart-total-details')
      .filter({ has: this.page.getByText(label, { exact: true }) });
    return row.locator(':scope > *').nth(1);
  }

  public get subtotal(): Locator {
    return this.valueFor('Subtotal');
  }

  public get deliveryFee(): Locator {
    return this.valueFor('Delivery Fee');
  }

  public get total(): Locator {
    return this.valueFor('Total');
  }

  public get promoCodeField(): Locator {
    return this.page.getByRole('textbox', { name: 'Promo code' });
  }

  public get promoSubmitButton(): Locator {
    return this.page.getByRole('button', { name: 'Submit' });
  }

  public async enterPromoCode(code: string): Promise<void> {
    await this.promoCodeField.fill(code);
    await this.promoSubmitButton.click();
  }

  /** Removes a single unit of the given dish. */
  public async removeOneUnit(dishName: string): Promise<void> {
    await this.removeOne(dishName).click();
  }

  /** Removes every cart row (one unit per click) until the cart is empty. */
  public async removeAllItems(): Promise<void> {
    while ((await this.removeControls.count()) > 0) {
      await this.removeControls.first().click();
    }
  }

  /** The current cart Total as text (e.g. "$16"). */
  public async totalValue(): Promise<string> {
    return (await this.total.textContent())?.trim() ?? '';
  }
}
