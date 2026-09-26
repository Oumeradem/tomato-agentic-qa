import * as fs from 'node:fs';
import * as path from 'node:path';
import { BrowserContext, Page, Video } from '@playwright/test';
import { config } from '../config/config';
import { logger } from './logger';
import { VideoMode } from '../types';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const REPORT_ROOT = path.join(PROJECT_ROOT, 'reports');

/**
 * Minimal shape of Cucumber's `World#attach` that this helper relies on.
 *
 * Cucumber's `ICreateAttachment` accepts either a media type string or an
 * options object with a required `mediaType` — mirrored here so `CustomWorld`
 * is assignable to this sink.
 */
export interface AttachmentSink {
  attach(
    data: string | Buffer,
    mediaTypeOrOptions?: string | { mediaType: string; fileName?: string },
  ): void | Promise<void>;
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 120);
}

function ensureDir(dir: string): string {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Directory where Playwright writes raw recordings while a scenario runs.
 * Final videos are saved (or discarded) from here once the context closes.
 */
export function videoRecordingsDir(): string {
  return ensureDir(path.join(REPORT_ROOT, 'videos', '.recordings'));
}

/**
 * Captures a full-page screenshot for a passing scenario when `SCREENSHOT=on`
 * and attaches it to the report (Allure picks it up automatically).
 */
export async function capturePassScreenshot(sink: AttachmentSink, page: Page, scenarioName: string): Promise<void> {
  const safeName = sanitizeFilename(scenarioName);
  const dir = ensureDir(path.join(REPORT_ROOT, 'screenshots'));
  const screenshotPath = path.join(dir, `${safeName}.png`);
  try {
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await sink.attach(fs.readFileSync(screenshotPath), { mediaType: 'image/png', fileName: `${safeName}.png` });
    logger.info('Screenshot captured', { path: screenshotPath });
  } catch (error) {
    logger.warn('Failed to capture screenshot', { error: String(error) });
  }
}

/**
 * Finalizes the recorded video for a scenario once the context has closed.
 * Keeps the video when `VIDEO=on` or when `VIDEO=retain-on-failure` and the
 * scenario failed; otherwise discards the recording.
 */
export async function saveOrDiscardVideo(
  video: Video | null,
  scenarioName: string,
  mode: VideoMode,
  isFailed: boolean,
): Promise<void> {
  if (!video) return;
  const keep = mode === 'on' || (mode === 'retain-on-failure' && isFailed);
  try {
    const source = await video.path();
    if (keep) {
      const dir = ensureDir(path.join(REPORT_ROOT, 'videos'));
      const dest = path.join(dir, `${sanitizeFilename(scenarioName)}.webm`);
      await video.saveAs(dest);
      logger.info('Video saved', { path: dest });
    } else {
      logger.info('Discarded video (not retained)');
    }
    // Remove the temporary recording regardless of whether it was kept.
    fs.rmSync(source, { force: true });
  } catch (error) {
    logger.warn('Failed to finalize video', { error: String(error) });
  }
}

function ensureArtifactsDir(): string {
  const dir = path.join(PROJECT_ROOT, 'reports', 'artifacts');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function captureScreenshot(page: Page, filePath: string): Promise<void> {
  await page.screenshot({ path: filePath, fullPage: true });
}

async function captureTrace(context: BrowserContext, filePath: string): Promise<void> {
  await context.tracing.stop({ path: filePath });
}

/**
 * Captures failure artifacts for a failed scenario and attaches them to the
 * Cucumber report via `World#attach`. The Allure reporter picks up these
 * attachments automatically, so one code path covers both reports and works
 * in single-threaded and parallel execution modes.
 */
export async function captureFailureArtifacts(
  sink: AttachmentSink,
  page: Page,
  context: BrowserContext,
  scenarioName: string,
  errorMessage: string | undefined,
  consoleErrors: string[],
): Promise<void> {
  const safeName = sanitizeFilename(scenarioName);
  const dir = ensureArtifactsDir();

  // 1. Screenshot
  try {
    const screenshotPath = path.join(dir, `${safeName}.png`);
    await captureScreenshot(page, screenshotPath);
    await sink.attach(fs.readFileSync(screenshotPath), { mediaType: 'image/png', fileName: `${safeName}.png` });
    logger.info('Failure screenshot captured', { path: screenshotPath });
  } catch (error) {
    logger.warn('Failed to capture screenshot', { error: String(error) });
  }

  // 2. Trace (when enabled)
  if (config.trace !== 'off') {
    try {
      const tracePath = path.join(dir, `${safeName}.zip`);
      await captureTrace(context, tracePath);
      await sink.attach(fs.readFileSync(tracePath), { mediaType: 'application/zip', fileName: `${safeName}.zip` });
      logger.info('Failure trace captured', { path: tracePath });
    } catch (error) {
      logger.warn('Failed to capture trace', { error: String(error) });
    }
  }

  // 3. Error message
  if (errorMessage) {
    try {
      await sink.attach(errorMessage, { mediaType: 'text/plain', fileName: 'error-message.txt' });
    } catch (error) {
      logger.warn('Failed to attach error message', { error: String(error) });
    }
  }

  // 4. Console / page errors
  if (consoleErrors.length > 0) {
    try {
      await sink.attach(consoleErrors.join('\n'), { mediaType: 'text/plain', fileName: 'console-errors.txt' });
    } catch (error) {
      logger.warn('Failed to attach console errors', { error: String(error) });
    }
  }
}
