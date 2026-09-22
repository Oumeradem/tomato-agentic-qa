import * as fs from 'fs';
import * as path from 'path';
import { config } from '../config/config';

/**
 * Writes Allure `environment.properties` so reports show environment info
 * (environment, browser, base URL, headless mode).
 */
export function writeEnvironmentInfo(): void {
  const resultsDir =
    process.env.ALLURE_RESULTS_PATH || path.join(process.cwd(), 'reports', 'allure-results');
  fs.mkdirSync(resultsDir, { recursive: true });
  const content = [
    `Environment=${config.env}`,
    `Browser=${config.browser}`,
    `Base URL=${config.baseUrl}`,
    `Headless=${config.headless}`,
  ].join('\n');
  fs.writeFileSync(path.join(resultsDir, 'environment.properties'), content, 'utf8');
}
