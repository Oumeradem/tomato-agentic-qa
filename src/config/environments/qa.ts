import { EnvironmentConfig } from '../../types/config';

/**
 * QA environment configuration.
 * Replace baseUrl with your QA environment URL.
 */
export const qa: EnvironmentConfig = {
  name: 'qa',
  baseUrl: 'http://localhost:3100',
  appTitle: 'Login',
};
