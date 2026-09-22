import { EnvironmentConfig } from '../../types/config';

/**
 * DEV environment configuration.
 * Replace baseUrl with your local development environment URL.
 */
export const dev: EnvironmentConfig = {
  name: 'dev',
  baseUrl: 'http://localhost:3100',
  appTitle: 'Login',
};
