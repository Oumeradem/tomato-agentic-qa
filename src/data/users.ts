import { config } from '../config/config';

export interface User {
  username: string;
  password: string;
  role?: string;
}

/**
 * Static test data. Never store secrets here — credentials come from
 * environment variables via the central config.
 */
export const users: Record<string, User> = {
  valid: {
    username: config.credentials.username,
    password: config.credentials.password,
    role: 'admin',
  },
  invalid: {
    username: 'invalid-user',
    password: 'invalid-pass',
  },
};
