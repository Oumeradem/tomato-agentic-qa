import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { Header } from './components/Header';

/**
 * The Tomato Food Delivery menu and cart.
 *
 * The dish list ("Top dishes near you") lives on the home page; each dish is a
 * `.food-item` card with an image, a name, a description, and a price, plus an
 * `img.add[alt="Add to cart"]` control. The cart page is `/cart`: rows are
 * `.cart-items-item`, and the totals live under `.cart-total` (a flat $2
 * delivery fee is added to the subtotal). Cart state is client-side, so tests
 * navigate to the cart via the header link (SPA), not a hard reload.
 */
export class InventoryPage extends BasePage {
  public readonly dishesHeading: Locator = this.page.getByRole('heading', { name: 'Top dishes near you' });
  public readonly menuHeading: Locator = this.page.getByRole('heading', { name: 'Explore our menu' });
  public readonly dishCards: Locator = this.page.locator('.food-item');
  public readonly cartRows: Locator = this.page.locator('.cart-items-item');

  public constructor(
    page: InventoryPage['page'],
    private readonly header: Header,
  ) {
    super(page);
  }

  public override async waitForReady(): Promise<void> {
    await this.dishesHeading.waitFor({ state: 'visible' });
  }

  private dishCard(dishName: string): Locator {
    return this.dishCards.filter({ has: this.page.getByAltText(dishName, { exact: true }) }).first();
  }

  private cartRow(dishName: string): Locator {
    return this.cartRows.filter({ has: this.page.getByAltText(dishName, { exact: true }) }).first();
  }

  public async addDishToCart(dishName: string): Promise<void> {
    await this.dishCard(dishName).getByAltText('Add to cart').click();
  }

  public async openCart(): Promise<void> {
    await this.header.openCart();
  }

  public async getCartItemCount(): Promise<number> {
    return this.cartRows.count();
  }

  public async removeFromCart(dishName: string): Promise<void> {
    await this.cartRow(dishName).locator('p.cross').click();
  }

  /** Parses the cart "Total" (subtotal + $2 delivery fee) to a number. */
  public async getCartTotal(): Promise<number> {
    const totalRow = this.page
      .locator('.cart-total-details')
      .filter({ has: this.page.getByText('Total', { exact: true }) });
    const text = await totalRow.locator('b').last().textContent();
    return Number(text?.replace(/[^0-9.]/g, '') ?? 0);
  }
}
