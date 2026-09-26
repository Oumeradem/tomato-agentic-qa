import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { config } from '../config/config';
import { CustomWorld } from '../support/world';

/* ----- Cancelled / failed payment redirect test ----- */

Given(
  'I open the Tomato order verification page for a failed payment',
  async function (this: CustomWorld): Promise<void> {
    await this.page.goto(`${config.baseUrl}/verify?success=false`, { waitUntil: 'domcontentloaded' });
  },
);

Then('I am returned to the Tomato home page', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.menuPage.heroHeading).toBeVisible();
});
