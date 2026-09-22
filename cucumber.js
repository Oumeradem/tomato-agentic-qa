/**
 * Cucumber configuration.
 *
 * The actual browser/session lifecycle is driven by the custom World
 * (src/support/world.ts) and hooks (src/hooks/hooks.ts).
 *
 * Run via: npm test
 */
const path = require('path');
const os = require('os');

// Overridable via env (e.g. ENV=qa BROWSER=firefox HEADLESS=true)
const env = process.env.ENV || 'qa';
const browser = process.env.BROWSER || 'chromium';
const headless = process.env.HEADLESS !== 'false';
const isCI = Boolean(process.env.CI);

// Allure results output directory
const allureResultsDir = path.join(__dirname, 'reports', 'allure-results');

module.exports = {
  default: {
    require: ['ts-node/register', 'src/support/**/*.ts', 'src/hooks/**/*.ts', 'src/steps/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      `json:reports/cucumber-report/cucumber-report.json`,
      `html:reports/cucumber-report/cucumber-report.html`,
      'allure-cucumberjs/reporter',
    ],
    formatOptions: {
      snippetInterface: 'async-await',
      // The allure-cucumberjs reporter reads these from the formatter options.
      resultsDir: allureResultsDir,
      environmentInfo: {
        os_platform: os.platform(),
        os_release: os.release(),
        os_version: os.version(),
        node_version: process.version,
        env,
        browser,
        headless: String(headless),
      },
    },
    publishQuiet: true,
    retry: isCI ? 1 : 0,
    parallel: isCI ? 2 : 1,
    paths: ['features/**/*.feature'],
    worldParameters: {
      env,
      browser,
      headless,
    },
  },
};
