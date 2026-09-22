import { EnvironmentConfig } from '../../types/config';

/**
 * PROD environment configuration.
 * Replace baseUrl with your production environment URL.
 */
export const prod: EnvironmentConfig = {
  name: 'prod',
  baseUrl: 'http://localhost:3100',
  appTitle: 'Login',
};
