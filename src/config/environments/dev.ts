import { EnvironmentConfig } from '../../types';

/**
 * Dev environment configuration.
 *
 * The example suite targets the Tomato Food Delivery application
 * (tomato-food-delivery-zeta.vercel.app) - the application under test.
 */
export const devConfig: EnvironmentConfig = {
  name: 'dev',
  baseUrl: 'https://tomato-food-delivery-zeta.vercel.app',
  apiBaseUrl: 'https://food-del-backend-api-croo.onrender.com',
};
