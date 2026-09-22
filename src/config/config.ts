import * as dotenv from 'dotenv';
import * as path from 'path';
import { AppConfig, BrowserName, EnvironmentName } from '../types/config';
import { dev } from './environments/dev';
import { qa } from './environments/qa';
import { stage } from './environments/stage';
import { prod } from './environments/prod';

// Load environment variables from .env (never committed).
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const environmentMap: Record<EnvironmentName, { baseUrl: string; appTitle?: string }> = {
  dev,
  qa,
  stage,
  prod,
};

const selectedEnv = (process.env.ENV || 'qa').toLowerCase() as EnvironmentName;
const envConfig = environmentMap[selectedEnv] ?? qa;

/**
 * Centralized application configuration.
 *
 * All environment variables are read here ONLY. The rest of the framework
 * should use `config.*` rather than accessing `process.env` directly.
 */
export const config: AppConfig = {
  env: selectedEnv,
  baseUrl: process.env.BASE_URL || envConfig.baseUrl,
  credentials: {
    username: process.env.USERNAME || '',
    password: process.env.PASSWORD || '',
  },
  browser: (process.env.BROWSER || 'chromium') as BrowserName,
  headless: process.env.HEADLESS !== 'false',
  timeout: {
    action: Number(process.env.ACTION_TIMEOUT) || 15000,
    navigation: Number(process.env.NAVIGATION_TIMEOUT) || 30000,
    expect: Number(process.env.EXPECT_TIMEOUT) || 15000,
  },
  retries: Number(process.env.RETRIES) || (process.env.CI ? 1 : 0),
  artifacts: {
    screenshot: 'only-on-failure',
    video: process.env.VIDEO === 'true' ? 'retain-on-failure' : 'off',
    trace: process.env.TRACE === 'true' ? 'retain-on-failure' : 'on-first-retry',
  },
  jira: {
    baseUrl: process.env.JIRA_BASE_URL || '',
    email: process.env.JIRA_EMAIL || '',
    apiToken: process.env.JIRA_API_TOKEN || '',
    projectKey: process.env.JIRA_PROJECT_KEY || '',
  },
};

export type { BrowserName, EnvironmentName };
export { selectedEnv as currentEnvironment };
