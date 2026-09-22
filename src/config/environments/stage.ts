import { EnvironmentConfig } from '../../types/config';

/**
 * STAGE environment configuration.
 * Replace baseUrl with your staging environment URL.
 */
export const stage: EnvironmentConfig = {
  name: 'stage',
  baseUrl: 'http://localhost:3100',
  appTitle: 'Login',
};
