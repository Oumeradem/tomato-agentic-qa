/**
 * Convert recorded WebM videos to MP4 (H.264) for universal playback.
 *
 * Playwright records scenarios as WebM (VP8/VP9 video + Opus audio), which
 * macOS QuickTime and Windows Media Player cannot decode. This helper
 * re-encodes them to MP4 so they open in any default player.
 *
 * Usage:
 *   npm run videos:mp4
 *
 * Requires ffmpeg on the PATH. Degrades gracefully when ffmpeg is missing or
 * when there are no WebM recordings, so it never breaks a pipeline.
 */
'use strict';

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const videoDir = path.join(root, 'reports', 'videos');

/** Returns true when ffmpeg is available on the PATH. */
function hasFfmpeg() {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const webms = fs.existsSync(videoDir)
  ? fs.readdirSync(videoDir).filter((file) => file.toLowerCase().endsWith('.webm'))
  : [];

if (webms.length === 0) {
  console.log('[convert-videos] no .webm files found in reports/videos — nothing to do.');
  process.exit(0);
}

if (!hasFfmpeg()) {
  console.error(
    '[convert-videos] ffmpeg is not installed, so videos cannot be converted to MP4.\n' +
      '  Install it first (e.g. `brew install ffmpeg` on macOS, `apt install ffmpeg` on Debian/Ubuntu).\n' +
      '  Until then, open the .webm files in Chrome, Edge, or VLC.',
  );
  process.exit(0);
}

let converted = 0;
let failed = 0;

for (const file of webms) {
  const input = path.join(videoDir, file);
  const output = path.join(videoDir, file.replace(/\.webm$/i, '.mp4'));
  try {
    execFileSync(
      'ffmpeg',
      ['-y', '-i', input, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-movflags', '+faststart', output],
      { stdio: 'ignore' },
    );
    converted += 1;
    console.log(`[convert-videos] converted ${file} -> ${path.basename(output)}`);
  } catch (error) {
    failed += 1;
    console.error(`[convert-videos] failed to convert ${file}: ${error.message}`);
  }
}

console.log(`[convert-videos] done. converted=${converted} failed=${failed}`);

if (failed > 0) {
  process.exitCode = 1;
}
