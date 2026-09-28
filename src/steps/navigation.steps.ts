import { Given } from '@cucumber/cucumber';
import { config } from '../config/config';
import { CustomWorld } from '../support/world';

/**
 * Shared navigation step. Reused across features (cart, login, ...) so keep it
 * here rather than duplicating it per-feature.
 */
Given('I open the Tomato home page', async function (this: CustomWorld): Promise<void> {
  await this.pages.loginPage.goto(config.baseUrl);
});
