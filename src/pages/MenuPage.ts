import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { config } from '../config/config';

/**
 * The Tomato home page: the category filter plus the "Top dishes near you"
 * dish list.
 *
 * Live app notes (verified against the deployed app):
 * - The app renders "Butter Noodles" as "Buttter Noodles" (upstream typo); the
 *   feature file and locators keep the exact UI spelling.
 * - A dish card (div.food-item) holds the dish image (alt = dish name), an
 *   "Add to cart" image, and - once added - a quantity stepper
 *   (div.food-item-counter: "Remove one" / quantity / "Add one").
 * - Category labels are plain paragraphs; selecting one filters the list
 *   client-side against the menu API data.
 */
const NOODLE_DISHES: readonly string[] = ['Buttter Noodles', 'Veg Noodles', 'Somen Noodles', 'Cooked Noodles'];

/** Alt text of images inside a dish card that are not the dish itself. */
const CONTROL_IMAGE_ALTS = new Set(['Add to cart', 'Add one', 'Remove one', 'Rating']);

export class MenuPage extends BasePage {
  public constructor(page: Page) {
    super(page);
  }

  /** Navigates to the home/menu page. */
  public async open(): Promise<void> {
    await this.goto(config.baseUrl);
  }

  /** Returns to the menu via the header "Home" link (SPA nav, preserves the cart). */
  public async returnToMenu(): Promise<void> {
    await this.page.getByRole('link', { name: 'Home' }).click();
    await this.page.getByRole('heading', { name: 'Top dishes near you' }).waitFor({ state: 'visible' });
  }

  /** The "Top dishes near you" section (div.food-display) that lists dishes. */
  public get dishSection(): Locator {
    return this.page.getByRole('heading', { name: 'Top dishes near you' }).locator('..');
  }

  /** Filters the dish list by clicking the given category label. */
  public async selectCategory(category: string): Promise<void> {
    await this.page.getByText(category, { exact: true }).click();
  }

  /** The dish card element (div.food-item) for the given dish. */
  public dishCard(dishName: string): Locator {
    // DOM: img.food-item-image > div.food-item-img-container > div.food-item
    return this.dishSection.getByRole('img', { name: dishName, exact: true }).locator('..').locator('..');
  }

  /** A control image inside a dish card (e.g. "Add to cart", "Add one"). */
  public control(dishName: string, controlName: string): Locator {
    return this.dishCard(dishName).getByRole('img', { name: controlName, exact: true });
  }

  /** The price paragraph on a dish card (e.g. "$14"). */
  public price(dishName: string): Locator {
    return this.dishCard(dishName).locator('p.food-item-price');
  }

  /** The quantity paragraph inside the dish stepper (e.g. "1"). */
  public quantity(dishName: string): Locator {
    // DOM: div.food-item-counter with img "Remove one", p quantity, img "Add one".
    return this.control(dishName, 'Add one').locator('..').locator('p').first();
  }

  /** Adds a dish to the cart (clicks its "Add to cart" control). */
  public async addToCart(dishName: string): Promise<void> {
    await this.control(dishName, 'Add to cart').click();
  }

  /** Clicks the stepper "+" control once. */
  public async increaseQuantity(dishName: string): Promise<void> {
    await this.control(dishName, 'Add one').click();
  }

  /** Clicks the stepper "−" control once. */
  public async decreaseQuantity(dishName: string): Promise<void> {
    await this.control(dishName, 'Remove one').click();
  }

  /** Names of all dishes currently rendered in the filtered dish list. */
  public async visibleDishNames(): Promise<string[]> {
    // Wait for the list to render after a category change before reading it.
    await this.dishSection.locator('img.food-item-image').first().waitFor({ state: 'visible' });
    const alts = await this.dishSection
      .locator('img[alt]')
      .evaluateAll((images) => images.map((image) => image.getAttribute('alt') ?? ''));
    return alts.filter((alt) => alt !== '' && !CONTROL_IMAGE_ALTS.has(alt));
  }

  /** The exact dish names the app renders under the "Noodles" category. */
  public get noodleDishes(): readonly string[] {
    return NOODLE_DISHES;
  }
}
