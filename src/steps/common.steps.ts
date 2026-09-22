import { Given } from '@cucumber/cucumber';
import { World } from '../support/world';

/**
 * Reusable navigation step that works for any page.
 * Page objects expose their own `open()` so specific pages should prefer that.
 */
Given('the user navigates to {string}', async function (this: World, path: string): Promise<void> {
  await this.page.goto(`${new URL(this.page.url()).origin}${path}`);
});
