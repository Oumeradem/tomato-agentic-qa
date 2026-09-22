import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { World } from '../support/world';

Given('the user is on the login page', async function (this: World): Promise<void> {
  await this.loginPage.open();
});

When('the user logs in with valid credentials', async function (this: World): Promise<void> {
  await this.loginPage.loginWithValidCredentials();
});

When(
  'the user logs in with username {string} and password {string}',
  async function (this: World, username: string, password: string): Promise<void> {
    await this.loginPage.login(username, password);
  },
);

Then('the dashboard should be displayed', async function (this: World): Promise<void> {
  await this.dashboardPage.isLoaded();
});

Then('the user should see an error message', async function (this: World): Promise<void> {
  const message = await this.loginPage.getErrorMessage();
  expect(message).not.toBe('');
});
