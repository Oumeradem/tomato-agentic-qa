import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { config } from '../config/config';

/**
 * Step definitions for the "View Menu" hero button on the home page.
 * Thin steps that delegate to the MenuPage object.
 */

/** Escapes config.baseUrl so it can be reused in a RegExp URL assertion. */
function baseUrlRegExp(): RegExp {
  const escaped = config.baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}/?$`);
}

Then('the View Menu button is visible', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.menuPage.viewMenuButton).toBeVisible();
});

When('I click the View Menu button', async function (this: CustomWorld): Promise<void> {
  await this.pages.menuPage.clickViewMenu();
});

Then('the hero heading {string} is visible', async function (this: CustomWorld, heading: string): Promise<void> {
  await expect(this.page.getByRole('heading', { name: heading })).toBeVisible();
});

Then('the Explore our menu section is scrolled into view', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.menuPage.exploreMenuHeading).toBeInViewport();
});

Then('the menu categories are visible', async function (this: CustomWorld): Promise<void> {
  for (const category of this.pages.menuPage.menuCategories) {
    await expect(this.pages.menuPage.menuCategory(category)).toBeVisible();
  }
});

Then('the page URL stays on the home page', async function (this: CustomWorld): Promise<void> {
  await expect(this.page).toHaveURL(baseUrlRegExp());
});
