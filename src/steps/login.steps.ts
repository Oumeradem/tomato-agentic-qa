import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Given('I open the application', async function (this: CustomWorld): Promise<void> {
  await this.pages.loginPage.open();
});

Given('I am on the Login page', async function (this: CustomWorld): Promise<void> {
  await this.pages.loginPage.openSignInModal();
  await expect(this.pages.loginPage.modalHeading).toBeVisible();
});

When(
  'I login with username {string} and password {string}',
  async function (this: CustomWorld, username: string, password: string): Promise<void> {
    await this.pages.loginPage.login(username, password);
  },
);

When('I sign in with my registered credentials', async function (this: CustomWorld): Promise<void> {
  await this.pages.loginPage.loginWithConfiguredCredentials();
});

When('I submit the login form with empty fields', async function (this: CustomWorld): Promise<void> {
  await this.pages.loginPage.openSignInModal();
  await this.pages.loginPage.submit();
});

Then('I am signed in', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.loginPage.modalHeading).toBeHidden();
});

Then('the menu page is displayed', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.inventoryPage.dishesHeading).toBeVisible();
});

Then('the login form remains open', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.loginPage.modalHeading).toBeVisible();
});

Then(
  'a login error message {string} should be displayed',
  async function (this: CustomWorld, expectedMessage: string): Promise<void> {
    const message = await this.pages.loginPage.getLoginErrorMessage();
    expect(message).toContain(expectedMessage);
  },
);
