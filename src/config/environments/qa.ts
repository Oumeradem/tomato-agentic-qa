import { EnvironmentConfig } from '../../types';

/**
 * QA environment configuration.
 *
 * The example suite targets the Tomato Food Delivery application
 * (tomato-food-delivery-zeta.vercel.app). In a real project this would point
 * to the QA environment of the application under test.
 */
export const qaConfig: EnvironmentConfig = {
  name: 'qa',
  baseUrl: 'https://tomato-food-delivery-zeta.vercel.app',
  apiBaseUrl: 'https://food-del-backend-api-croo.onrender.com',
};
