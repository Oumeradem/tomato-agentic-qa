import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * The Tomato checkout page (/order) — the "Delivery Information" form and the
 * Cart Total summary that precede the payment hand-off.
 *
 * Live app notes (verified against the deployed app 2026-09-26):
 * - Reached from the cart via the "PROCEED TO CHECKOUT" button. The route
 *   redirects back to /cart when the cart is empty.
 * - The delivery form has labelled textboxes: First name, Last name, Email
 *   address, Street, City, State, Zip code, Country, Phone. All are `required`,
 *   so submitting an empty form is blocked by native HTML5 validation.
 * - "PROCEED TO PAYMENT" posts the order and redirects to the hosted Stripe
 *   Checkout sandbox. The Stripe card fields live in deeply-nested cross-origin
 *   iframes with an invisible hCaptcha, so completing the card entry itself is
 *   a manual/sandbox step, not automated (we verify the hand-off instead).
 * - The Cart Total summary reuses the same layout as the cart page
 *   (div.cart-total-details rows; the value is the row's second child).
 */
export class OrderPage extends BasePage {
  public constructor(page: Page) {
    super(page);
  }

  /** The "Delivery Information" section heading (a p.title element in the DOM). */
  public get deliveryInfoHeading(): Locator {
    return this.page.locator('p.title').filter({ hasText: 'Delivery Information' });
  }

  public get firstNameField(): Locator {
    return this.page.getByPlaceholder('First name');
  }

  public get lastNameField(): Locator {
    return this.page.getByPlaceholder('Last name');
  }

  public get emailField(): Locator {
    return this.page.getByPlaceholder('Email address');
  }

  public get streetField(): Locator {
    return this.page.getByPlaceholder('Street');
  }

  public get cityField(): Locator {
    return this.page.getByPlaceholder('City');
  }

  public get stateField(): Locator {
    return this.page.getByPlaceholder('State');
  }

  public get zipField(): Locator {
    return this.page.getByPlaceholder('Zip code');
  }

  public get countryField(): Locator {
    return this.page.getByPlaceholder('Country');
  }

  public get phoneField(): Locator {
    return this.page.getByPlaceholder('Phone');
  }

  public get proceedToPaymentButton(): Locator {
    // The app's buttons lack role="button", so use getByText instead.
    return this.page.locator('button').filter({ hasText: 'PROCEED TO PAYMENT' });
  }

  /** The "Cart Total" summary block shown alongside the delivery form. */
  public get cartTotalHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Cart Total', exact: true });
  }

  private get totalsBlock(): Locator {
    return this.cartTotalHeading.locator('..');
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

  /** Fills the delivery information form with realistic customer data. */
  public async fillDeliveryInfo(): Promise<void> {
    await this.firstNameField.fill('Jane');
    await this.lastNameField.fill('Doe');
    await this.emailField.fill('jane.doe@example.com');
    await this.streetField.fill('1 Market St');
    await this.cityField.fill('Seattle');
    await this.stateField.fill('WA');
    await this.zipField.fill('98101');
    await this.countryField.fill('USA');
    await this.phoneField.fill('2065551234');
  }

  /** Clicks "PROCEED TO PAYMENT" (submits the delivery form). */
  public async proceedToPayment(): Promise<void> {
    await this.proceedToPaymentButton.click();
  }

  /** Native HTML5 validation message for the first-name field ('' when valid). */
  public async firstNameValidationMessage(): Promise<string> {
    return this.firstNameField.evaluate((input) => {
      const field = input as unknown as { validationMessage: string };
      return field.validationMessage;
    });
  }
}
