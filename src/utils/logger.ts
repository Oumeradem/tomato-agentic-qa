/**
 * Lightweight structured logger.
 *
 * Never log secrets (passwords, tokens, cookies). Respects LOG_LEVEL.
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel;
const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= (LEVEL_ORDER[LOG_LEVEL] ?? LEVEL_ORDER.info);
}

function write(level: LogLevel, message: string, ...args: unknown[]): void {
  if (!shouldLog(level)) return;
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (level === 'error') {
    console.error(line, ...args);
  } else {
    console.log(line, ...args);
  }
}

export const logger = {
  debug: (message: string, ...args: unknown[]): void => write('debug', message, ...args),
  info: (message: string, ...args: unknown[]): void => write('info', message, ...args),
  warn: (message: string, ...args: unknown[]): void => write('warn', message, ...args),
  error: (message: string, ...args: unknown[]): void => write('error', message, ...args),
};
