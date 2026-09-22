/**
 * Shared configuration types.
 */
export type EnvironmentName = 'dev' | 'qa' | 'stage' | 'prod';
export type BrowserName = 'chromium' | 'firefox' | 'webkit';

export interface EnvironmentConfig {
  /** Human friendly environment label. */
  name: string;
  /** Base URL for the application in this environment. */
  baseUrl: string;
  /** Optional expected application title (used in sanity assertions). */
  appTitle?: string;
}

export interface TimeoutConfig {
  /** Default timeout for Playwright actions (ms). */
  action: number;
  /** Navigation timeout (ms). */
  navigation: number;
  /** Default expect timeout (ms). */
  expect: number;
}

export interface ArtifactConfig {
  /** Screenshot behavior: 'off' | 'only-on-failure'. */
  screenshot: 'off' | 'only-on-failure';
  /** Video behavior: 'off' | 'retain-on-failure'. */
  video: 'off' | 'retain-on-failure';
  /** Trace behavior: 'off' | 'on-first-retry' | 'retain-on-failure'. */
  trace: 'off' | 'on-first-retry' | 'retain-on-failure';
}

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
}

export interface AppConfig {
  env: EnvironmentName;
  baseUrl: string;
  credentials: {
    username: string;
    password: string;
  };
  browser: BrowserName;
  headless: boolean;
  timeout: TimeoutConfig;
  retries: number;
  artifacts: ArtifactConfig;
  jira: JiraConfig;
}
