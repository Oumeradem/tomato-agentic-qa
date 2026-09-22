import { faker } from '@faker-js/faker';

export interface TestUser {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * Dynamic test data factory.
 *
 * Use `seed` to make generated data deterministic when debugging requires it;
 * omit it for realistic randomized data.
 */
export function generateTestUser(seed?: number): TestUser {
  if (seed !== undefined) {
    faker.seed(seed);
  }
  return {
    username: faker.internet.username(),
    password: faker.internet.password(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };
}
