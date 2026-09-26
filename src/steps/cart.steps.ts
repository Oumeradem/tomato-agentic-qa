import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

/* ----- Cart / menu navigation ----- */

When('I open the cart', async function (this: CustomWorld): Promise<void> {
  await this.pages.cartPage.open();
});

When('I return to the menu', async function (this: CustomWorld): Promise<void> {
  await this.pages.menuPage.returnToMenu();
});

/* ----- Menu browsing & category filtering ----- */

When('I select the menu category {string}', async function (this: CustomWorld, category: string): Promise<void> {
  await this.pages.menuPage.selectCategory(category);
});

Then('only noodle dishes are shown', async function (this: CustomWorld): Promise<void> {
  const visible = await this.pages.menuPage.visibleDishNames();
  expect(visible.length).toBeGreaterThan(0);
  for (const dish of visible) {
    expect(this.pages.menuPage.noodleDishes).toContain(dish);
  }
});

Then('no non-noodle dishes are displayed', async function (this: CustomWorld): Promise<void> {
  const visible = await this.pages.menuPage.visibleDishNames();
  const nonNoodle = visible.filter((dish) => !this.pages.menuPage.noodleDishes.includes(dish));
  expect(nonNoodle).toEqual([]);
});

Then(
  '{string} shows dishes from multiple categories',
  async function (this: CustomWorld, heading: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: heading })).toBeVisible();
    // A salad dish and a noodle dish both render on the unfiltered list.
    await expect(this.pages.menuPage.dishCard('Green salad')).toBeVisible();
    await expect(this.pages.menuPage.dishCard('Buttter Noodles')).toBeVisible();
  },
);

Then('a salad dish and a noodle dish are both present', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.menuPage.dishCard('Green salad')).toBeVisible();
  await expect(this.pages.menuPage.dishCard('Buttter Noodles')).toBeVisible();
});

Then(
  'the dish list includes {string} priced at ${int}',
  async function (this: CustomWorld, dish: string, price: number): Promise<void> {
    await expect(this.pages.menuPage.dishCard(dish)).toBeVisible();
    await expect(this.pages.menuPage.price(dish)).toHaveText(`$${price}`);
  },
);

Then('the dish list includes {string}', async function (this: CustomWorld, dish: string): Promise<void> {
  await expect(this.pages.menuPage.dishCard(dish)).toBeVisible();
});

Then('the dish list does not include {string}', async function (this: CustomWorld, dish: string): Promise<void> {
  await expect(this.pages.menuPage.dishCard(dish)).toBeHidden();
});

/* ----- Adding dishes & the menu stepper ----- */

When('I add {string} to the cart', async function (this: CustomWorld, dish: string): Promise<void> {
  await this.pages.menuPage.addToCart(dish);
});

When(
  'I add {string} and {string} to the cart',
  async function (this: CustomWorld, dish1: string, dish2: string): Promise<void> {
    await this.pages.menuPage.addToCart(dish1);
    await this.pages.menuPage.addToCart(dish2);
  },
);

When(
  'I add the ${int} dish {string} to the cart',
  async function (this: CustomWorld, _price: number, dish: string): Promise<void> {
    await this.pages.menuPage.addToCart(dish);
  },
);

Given(
  '{string} is in the cart with quantity {int}',
  async function (this: CustomWorld, dish: string, quantity: number): Promise<void> {
    // Scenarios may start on the menu or on the cart page; the dish must be
    // added from the menu, then the starting page is restored.
    const startedOnCart = await this.pages.cartPage.cartTotalHeading.isVisible();
    await this.pages.menuPage.open();
    await this.pages.menuPage.addToCart(dish);
    for (let added = 1; added < quantity; added += 1) {
      await this.pages.menuPage.increaseQuantity(dish);
    }
    if (startedOnCart) {
      await this.pages.cartPage.open();
    }
  },
);

When('I increase the quantity of {string}', async function (this: CustomWorld, dish: string): Promise<void> {
  await this.pages.menuPage.increaseQuantity(dish);
});

When('I decrease the quantity of {string}', async function (this: CustomWorld, dish: string): Promise<void> {
  await this.pages.menuPage.decreaseQuantity(dish);
});

Then(
  'the quantity stepper for {string} shows {int}',
  async function (this: CustomWorld, dish: string, quantity: number): Promise<void> {
    await expect(this.pages.menuPage.quantity(dish)).toHaveText(String(quantity));
  },
);

Then(
  'the quantity stepper for {string} still shows {int}',
  async function (this: CustomWorld, dish: string, quantity: number): Promise<void> {
    await expect(this.pages.menuPage.quantity(dish)).toHaveText(String(quantity));
  },
);

Then(
  '{string} shows an {string} control',
  async function (this: CustomWorld, dish: string, control: string): Promise<void> {
    await expect(this.pages.menuPage.control(dish, control)).toBeVisible();
  },
);

Then(
  '{string} no longer shows an {string} control',
  async function (this: CustomWorld, dish: string, control: string): Promise<void> {
    await expect(this.pages.menuPage.control(dish, control)).toBeHidden();
  },
);

Then('{string} is no longer in the cart', async function (this: CustomWorld, dish: string): Promise<void> {
  await expect(this.pages.menuPage.control(dish, 'Add to cart')).toBeVisible();
  await expect(this.pages.menuPage.control(dish, 'Add one')).toBeHidden();
});

/* ----- Cart page rows & totals ----- */

Then(
  'the cart shows a row for {string} priced at ${int}',
  async function (this: CustomWorld, dish: string, price: number): Promise<void> {
    await expect(this.pages.cartPage.row(dish)).toBeVisible();
    await expect(this.pages.cartPage.rowPrice(dish)).toHaveText(`$${price}`);
  },
);

Then(
  'the {string} row shows quantity {int} and a line total of ${int}',
  async function (this: CustomWorld, dish: string, quantity: number, lineTotal: number): Promise<void> {
    await expect(this.pages.cartPage.rowQuantity(dish)).toHaveText(String(quantity));
    await expect(this.pages.cartPage.rowLineTotal(dish)).toHaveText(`$${lineTotal}`);
  },
);

Then('the cart Subtotal is ${int}', async function (this: CustomWorld, value: number): Promise<void> {
  await expect(this.pages.cartPage.subtotal).toHaveText(`$${value}`);
});

Then('the Delivery Fee is ${int}', async function (this: CustomWorld, value: number): Promise<void> {
  await expect(this.pages.cartPage.deliveryFee).toHaveText(`$${value}`);
});

Then('the cart Total is ${int}', async function (this: CustomWorld, value: number): Promise<void> {
  await expect(this.pages.cartPage.total).toHaveText(`$${value}`);
});

Then(
  'the Subtotal, Delivery Fee, and Total all equal ${int}',
  async function (this: CustomWorld, value: number): Promise<void> {
    await expect(this.pages.cartPage.subtotal).toHaveText(`$${value}`);
    await expect(this.pages.cartPage.deliveryFee).toHaveText(`$${value}`);
    await expect(this.pages.cartPage.total).toHaveText(`$${value}`);
  },
);

Then(
  'the cart line total for {string} is ${int}',
  async function (this: CustomWorld, dish: string, value: number): Promise<void> {
    // The menu shows no line totals; open the cart to read the row's line total.
    await this.pages.cartPage.open();
    await expect(this.pages.cartPage.rowLineTotal(dish)).toHaveText(`$${value}`);
  },
);

/* ----- Removing items ----- */

When('I remove one {string} from the cart', async function (this: CustomWorld, dish: string): Promise<void> {
  await this.pages.cartPage.removeOneUnit(dish);
});

When('I remove all items from the cart', async function (this: CustomWorld): Promise<void> {
  await this.pages.cartPage.removeAllItems();
});

Then('the cart shows no item rows', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.cartPage.removeControls).toHaveCount(0);
});

/* ----- Promo code ----- */

When('I enter an invalid promo code {string}', async function (this: CustomWorld, code: string): Promise<void> {
  this.scenarioContext.totalBeforePromo = await this.pages.cartPage.totalValue();
  await this.pages.cartPage.enterPromoCode(code);
});

Then('the cart Total is unchanged', async function (this: CustomWorld): Promise<void> {
  const before = this.scenarioContext.totalBeforePromo as string;
  expect(await this.pages.cartPage.totalValue()).toBe(before);
});
