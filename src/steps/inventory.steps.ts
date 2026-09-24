import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

When('I add the dish {string} to the cart', async function (this: CustomWorld, dishName: string): Promise<void> {
  await this.pages.inventoryPage.addDishToCart(dishName);
});

When('I open the cart', async function (this: CustomWorld): Promise<void> {
  await this.pages.inventoryPage.openCart();
});

When('I remove the dish {string} from the cart', async function (this: CustomWorld, dishName: string): Promise<void> {
  await this.pages.inventoryPage.removeFromCart(dishName);
});

Then('the cart contains {int} items', async function (this: CustomWorld, expectedCount: number): Promise<void> {
  const actualCount = await this.pages.inventoryPage.getCartItemCount();
  expect(actualCount).toBe(expectedCount);
});

Then('the cart total is ${int}', async function (this: CustomWorld, expectedTotal: number): Promise<void> {
  const actualTotal = await this.pages.inventoryPage.getCartTotal();
  expect(actualTotal).toBe(expectedTotal);
});
