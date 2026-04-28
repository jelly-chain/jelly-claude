#!/usr/bin/env node
/**
 * Live voice transcript overlay - displays recent speech in terminal header.
 * Watches logs/voice-queue.jsonl and prints to stdout (for Claude CLI to see).
 */

import fs from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);

const QUEUE_FILE = `${ROOT}/logs/voice-queue.jsonl`;
const DISPLAY_LINES = 3;
const POLL_INTERVAL_MS = 2_000;

let lastShown = 0;

function showRecent() {
  if (!fs.existsSync(QUEUE_FILE)) return;

  const lines = fs.readFileSync(QUEUE_FILE, 'utf-8').trim().split('\n').filter(Boolean);
  const recent = lines.slice(-DISPLAY_LINES);

  if (recent.length === 0 || lines.length === lastShown) return;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎤 LIVE VOICE TRANSCRIPT:');
  for (const line of recent) {
    try {
      const entry = JSON.parse(line);
      const time = new Date(entry.ts).toLocaleTimeString('en-US', { hour12: false });
      console.log(`   [${time}] ${entry.text}`);
    } catch {}
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  lastShown = lines.length;
}

console.log('[live-display] starting voice transcript display');
setInterval(showRecent, POLL_INTERVAL_MS);
showRecent();
