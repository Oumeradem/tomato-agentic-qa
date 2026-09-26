import { Then, When } from '@cucumber/cucumber';
import { expect, Locator } from '@playwright/test';
import { CustomWorld } from '../support/world';

/**
 * Step definitions for the header navigation tabs (Home, Menu, Mobile App,
 * Contact Us, Search, Cart, Sign In). Thin steps delegating to the Header
 * component / page objects.
 */

/** Resolves a header tab name to its locator (keeps steps thin and reusable). */
function headerTab(world: CustomWorld, name: string): Locator {
  switch (name) {
    case 'Home':
      return world.pages.header.homeTab;
    case 'Menu':
      return world.pages.header.menuTab;
    case 'Mobile App':
      return world.pages.header.mobileAppTab;
    case 'Contact Us':
      return world.pages.header.contactUsTab;
    case 'Cart':
      return world.pages.header.cartTab;
    case 'Sign In':
      return world.pages.header.signInButton;
    default:
      throw new Error(`Unknown header tab: "${name}"`);
  }
}

Then('the header shows the Tomato logo', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.header.tomatoLogo).toBeVisible();
});

Then('the header shows a {string} tab', async function (this: CustomWorld, name: string): Promise<void> {
  await expect(headerTab(this, name)).toBeVisible();
});

Then('the header shows a {string} control', async function (this: CustomWorld, name: string): Promise<void> {
  if (name !== 'Search') {
    throw new Error(`Unknown header control: "${name}"`);
  }
  await expect(this.pages.header.searchControl).toBeVisible();
});

When('I click the {string} tab', async function (this: CustomWorld, name: string): Promise<void> {
  await headerTab(this, name).click();
});

When('I click the Tomato logo', async function (this: CustomWorld): Promise<void> {
  await this.pages.header.tomatoLogo.click();
});

Then('the Home tab points to the home page', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.header.homeTab).toHaveAttribute('href', '/');
});

Then('the Menu tab points to the explore-menu section', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.header.menuTab).toHaveAttribute('href', '#explore-menu');
});

Then('the Mobile App tab points to the app-download section', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.header.mobileAppTab).toHaveAttribute('href', '#app-download');
});

Then('the Contact Us tab points to the footer', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.header.contactUsTab).toHaveAttribute('href', '#footer');
});

Then('the Cart tab points to the cart page', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.header.cartTab).toHaveAttribute('href', '/cart');
});

Then('the home page is shown', async function (this: CustomWorld): Promise<void> {
  await expect(this.page.getByRole('heading', { name: 'Top dishes near you' })).toBeVisible();
});

Then('the cart page is shown', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.cartPage.cartTotalHeading).toBeVisible();
});

Then('the explore-menu section is in view', async function (this: CustomWorld): Promise<void> {
  await expect(this.page.getByRole('heading', { name: 'Explore our menu' })).toBeVisible();
});
