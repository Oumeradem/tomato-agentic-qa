import * as fs from 'fs';
import * as path from 'path';
import { attachment, ContentType } from 'allure-js-commons';
import { World } from '../support/world';
import { config } from '../config/config';
import { logger } from './logger';

/** Minimal shape of the Cucumber scenario object we need for artifacts. */
export interface ScenarioInfo {
  pickle?: { name?: string };
  result?: { message?: string; status?: string };
}

function safeName(name: string): string {
  return name.replace(/[^a-z0-9-_]/gi, '_').slice(0, 80);
}

function ensureDir(relativeDir: string): string {
  const dir = path.join(process.cwd(), relativeDir);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function attachSafely(
  name: string,
  content: Buffer | string,
  type: ContentType,
): Promise<void> {
  try {
    await attachment(name, content, type);
  } catch (err) {
    // Allure only exposes an active test runtime during steps; outside that
    // (e.g. in the After hook) attachments are dropped. Files are still saved
    // to disk, so a failed attach must never break the teardown hook.
    logger.warn(`Allure attach skipped for "${name}":`, err);
  }
}

/**
 * Captures failure artifacts (screenshot, trace, error, console logs) and
 * attaches them to the Allure report. Called only when a scenario fails.
 */
export async function captureFailureArtifacts(world: World, scenario: ScenarioInfo): Promise<void> {
  const scenarioName = scenario?.pickle?.name || 'unknown-scenario';
  const tag = safeName(scenarioName);
  const timestamp = Date.now();
  const error = scenario?.result?.message || 'Unknown error';

  logger.error(`Capturing failure artifacts for scenario: ${scenarioName}`);

  // Screenshot (always attach on failure).
  if (world.page) {
    const screenshotDir = ensureDir('screenshots');
    const screenshotPath = path.join(screenshotDir, `${tag}-${timestamp}.png`);
    try {
      await world.page.screenshot({ path: screenshotPath, fullPage: true });
      await attachSafely('Screenshot', fs.readFileSync(screenshotPath), ContentType.PNG);
      await attachSafely('Screenshot path', screenshotPath, ContentType.TEXT);
    } catch (err) {
      logger.warn('Failed to capture screenshot:', err);
    }
  }

  // Trace (when enabled).
  if (world.context && config.artifacts.trace !== 'off') {
    const traceDir = ensureDir('traces');
    const tracePath = path.join(traceDir, `${tag}-${timestamp}.zip`);
    try {
      await world.context.tracing.stop({ path: tracePath });
      await attachSafely('Trace', fs.readFileSync(tracePath), ContentType.ZIP);
    } catch (err) {
      logger.warn('Failed to capture trace:', err);
    }
  }

  // Console logs.
  if (world.consoleLogs.length > 0) {
    await attachSafely('Console logs', world.consoleLogs.join('\n'), ContentType.TEXT);
  }

  // Error details.
  await attachSafely('Error message', error, ContentType.TEXT);
}
