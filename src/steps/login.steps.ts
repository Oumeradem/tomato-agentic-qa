import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { config } from '../config/config';
import { CustomWorld } from '../support/world';

interface StoredCredentials {
  readonly email: string;
  readonly password: string;
}

const DEFAULT_PASSWORD = 'TestPass123!';
const WRONG_PASSWORD = 'WrongPass123!';

function uniqueEmail(): string {
  return `user${Date.now()}@example.com`;
}

/**
 * Registers a fresh account via the backend API so the credentials exist without
 * a slow full-UI signup. Credentials are generated per scenario and kept in the
 * World (never hardcoded).
 */
async function registerUserViaApi(world: CustomWorld, credentials: StoredCredentials): Promise<void> {
  const response = await world.context.request.post(`${config.apiBaseUrl}/api/user/register`, {
    data: { name: 'Test User', email: credentials.email, password: credentials.password },
  });
  if (!response.ok()) {
    throw new Error(`Account registration failed (${response.status()}): ${await response.text()}`);
  }
}

async function ensureRegisteredUser(world: CustomWorld): Promise<StoredCredentials> {
  const existing = world.scenarioContext.credentials as StoredCredentials | undefined;
  if (existing) {
    return existing;
  }

  const credentials: StoredCredentials = { email: uniqueEmail(), password: DEFAULT_PASSWORD };
  await registerUserViaApi(world, credentials);

  world.scenarioContext.credentials = credentials;
  return credentials;
}

Given('I have a registered account', async function (this: CustomWorld): Promise<void> {
  await ensureRegisteredUser(this);
});

Given('I have credentials for an unregistered account', async function (this: CustomWorld): Promise<void> {
  this.scenarioContext.credentials = { email: uniqueEmail(), password: DEFAULT_PASSWORD };
});

When('I open the sign-in modal', async function (this: CustomWorld): Promise<void> {
  await this.pages.loginPage.open();
});

When('I submit the login form with empty fields', async function (this: CustomWorld): Promise<void> {
  await this.pages.loginPage.submit();
});

When('I enter the email {string}', async function (this: CustomWorld, email: string): Promise<void> {
  await this.pages.loginPage.fillEmail(email);
});

When('I submit the login form', async function (this: CustomWorld): Promise<void> {
  await this.pages.loginPage.submit();
});

When("I enter a registered user's email and password", async function (this: CustomWorld): Promise<void> {
  const credentials = await ensureRegisteredUser(this);
  if (!(await this.pages.loginPage.isOpen())) {
    await this.pages.loginPage.open();
  }
  await this.pages.loginPage.fillEmail(credentials.email);
  await this.pages.loginPage.fillPassword(credentials.password);
});

When('I submit the login form without accepting the terms', async function (this: CustomWorld): Promise<void> {
  await this.pages.loginPage.submit();
});

When('I log in accepting the terms', async function (this: CustomWorld): Promise<void> {
  const credentials = this.scenarioContext.credentials as StoredCredentials;
  await this.pages.loginPage.fillEmail(credentials.email);
  await this.pages.loginPage.fillPassword(credentials.password);
  await this.pages.loginPage.acceptTerms();
  const alertPromise = this.pages.loginPage.captureAlert();
  await this.pages.loginPage.submit();
  this.scenarioContext.alertMessage = await alertPromise;
});

When('I log in with a wrong password accepting the terms', async function (this: CustomWorld): Promise<void> {
  const credentials = this.scenarioContext.credentials as StoredCredentials;
  await this.pages.loginPage.fillEmail(credentials.email);
  await this.pages.loginPage.fillPassword(WRONG_PASSWORD);
  await this.pages.loginPage.acceptTerms();
  const alertPromise = this.pages.loginPage.captureAlert();
  await this.pages.loginPage.submit();
  this.scenarioContext.alertMessage = await alertPromise;
});

When('I log in with valid credentials accepting the terms', async function (this: CustomWorld): Promise<void> {
  const credentials = this.scenarioContext.credentials as StoredCredentials;
  await this.pages.loginPage.fillEmail(credentials.email);
  await this.pages.loginPage.fillPassword(credentials.password);
  await this.pages.loginPage.acceptTerms();
  await this.pages.loginPage.submit();
});

When('I click "Create a new account"', async function (this: CustomWorld): Promise<void> {
  await this.pages.loginPage.createAccountLink.click();
});

When('I close the modal', async function (this: CustomWorld): Promise<void> {
  await this.pages.loginPage.close();
});

Then('the Login modal is shown with email and password fields', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.loginPage.loginHeading).toBeVisible();
  await expect(this.pages.loginPage.emailField).toBeVisible();
  await expect(this.pages.loginPage.passwordField).toBeVisible();
});

Then('the login form is not submitted', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.loginPage.loginHeading).toBeVisible();
  expect(await this.pages.loginPage.loginRequestsSent()).toBe(0);
});

Then('the email field shows a required-field validation message', async function (this: CustomWorld): Promise<void> {
  const message = await this.pages.loginPage.emailValidationMessage();
  expect(message.length).toBeGreaterThan(0);
});

Then('the email field shows an email-format validation message', async function (this: CustomWorld): Promise<void> {
  const message = await this.pages.loginPage.emailValidationMessage();
  expect(message.length).toBeGreaterThan(0);
});

Then('no login request is sent', async function (this: CustomWorld): Promise<void> {
  expect(await this.pages.loginPage.loginRequestsSent()).toBe(0);
});

Then('an alert {string} is shown', async function (this: CustomWorld, message: string): Promise<void> {
  expect(this.scenarioContext.alertMessage).toBe(message);
});

Then('the Login modal closes', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.loginPage.loginHeading).toBeHidden();
});

Then(
  'the header shows the profile avatar instead of the {string} button',
  async function (this: CustomWorld, buttonText: string): Promise<void> {
    await expect(this.pages.loginPage.header.profileAvatar).toBeVisible();
    await expect(this.page.getByRole('button', { name: buttonText })).toBeHidden();
  },
);

Then(
  'the Sign Up modal is shown with name, email, and password fields',
  async function (this: CustomWorld): Promise<void> {
    await expect(this.pages.signUpModal.nameField).toBeVisible();
    await expect(this.pages.signUpModal.emailField).toBeVisible();
    await expect(this.pages.signUpModal.passwordField).toBeVisible();
  },
);

Then('the Login modal is shown', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.loginPage.loginHeading).toBeVisible();
});

Then('the Login modal is no longer shown', async function (this: CustomWorld): Promise<void> {
  await expect(this.pages.loginPage.loginHeading).toBeHidden();
});
