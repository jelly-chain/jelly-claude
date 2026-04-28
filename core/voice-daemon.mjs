#!/usr/bin/env node
/**
 * Buddy Voice Daemon
 *
 * Continuously listens on the microphone, transcribes short windows of audio
 * via `listen()` (OpenRouter STT → whisper.cpp → python whisper fallback),
 * and appends each transcript to `logs/voice-transcript.jsonl`.
 *
 * Runs in the background alongside Claude Code. Stop with SIGTERM/SIGINT.
 *
 * Env vars:
 *   BUDDY_VOICE_WINDOW_SEC   Length of each capture window (default 5)
 *   BUDDY_VOICE_IDLE_MS      Delay between windows (default 250)
 *   BUDDY_MIC_DEVICE         avfoundation device index (default 0 = built-in)
 */

import { appendFileSync, existsSync, mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listen } from './voice.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);
const LOG_DIR = join(ROOT, 'logs');
const TRANSCRIPT_FILE = join(LOG_DIR, 'voice-transcript.jsonl');
const PID_FILE = join(LOG_DIR, 'voice-daemon.pid');
const STATUS_FILE = join(LOG_DIR, 'voice-daemon.status');

const WINDOW_SEC = parseInt(process.env.BUDDY_VOICE_WINDOW_SEC || '5', 10);
const IDLE_MS = parseInt(process.env.BUDDY_VOICE_IDLE_MS || '250', 10);
const TTS_LOCKFILE = join(LOG_DIR, 'tts-speaking.lock');

if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });

try {
  // Write PID file so start-buddy.sh cleanup can find & kill us
  writeFileSync(PID_FILE, String(process.pid));
  writeFileSync(STATUS_FILE, JSON.stringify({
    pid: process.pid,
    startedAt: new Date().toISOString(),
    windowSec: WINDOW_SEC,
    state: 'running',
  }, null, 2));
} catch {}

let running = true;
function shutdown() {
  running = false;
  try { if (existsSync(PID_FILE)) unlinkSync(PID_FILE); } catch {}
  try { if (existsSync(STATUS_FILE)) unlinkSync(STATUS_FILE); } catch {}
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function log(line) {
  try {
    appendFileSync(TRANSCRIPT_FILE, JSON.stringify(line) + '\n');
  } catch {}
}

log({ ts: new Date().toISOString(), event: 'daemon_start', windowSec: WINDOW_SEC });

let consecutiveFailures = 0;
const MAX_FAILURES = 5;

while (running) {
  try {
    // Skip capture if TTS is currently speaking (prevents feedback loop)
    if (existsSync(TTS_LOCKFILE)) {
      await new Promise((r) => setTimeout(r, IDLE_MS));
      continue;
    }

    const r = await listen({ durationSec: WINDOW_SEC, live: false });
    if (r?.ok && r.text && r.text.trim()) {
      const entry = {
        ts: new Date().toISOString(),
        provider: r.provider,
        text: r.text.trim(),
      };
      log(entry);
      // Also echo to stderr so it's visible if the daemon is run in the foreground
      process.stderr.write(`🎤 ${entry.text}\n`);
      consecutiveFailures = 0;
    } else if (r && !r.ok) {
      consecutiveFailures++;
      log({ ts: new Date().toISOString(), event: 'listen_error', error: r.error || 'unknown' });
      if (consecutiveFailures >= MAX_FAILURES) {
        log({ ts: new Date().toISOString(), event: 'daemon_abort', reason: 'too_many_failures' });
        process.stderr.write('🎤 voice-daemon: too many failures, stopping.\n');
        break;
      }
    }
  } catch (e) {
    consecutiveFailures++;
    log({ ts: new Date().toISOString(), event: 'exception', error: e?.message || String(e) });
  }
  // short idle between windows
  await new Promise((r) => setTimeout(r, IDLE_MS));
}

shutdown();
