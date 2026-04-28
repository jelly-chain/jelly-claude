#!/usr/bin/env node
/**
 * Auto-poller: watches logs/voice-commands.txt for new lines and processes them.
 * Designed to run in the background during a Claude Code session.
 *
 * Usage:
 *   node core/voice-auto-poller.mjs &
 *
 * Processing strategy:
 *   - Reads last processed line number from logs/voice-poller-state.json
 *   - Checks for new lines every POLL_INTERVAL_MS
 *   - Writes new commands to logs/voice-queue.jsonl for Claude to check
 */

import fs from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);

const COMMANDS_FILE = `${ROOT}/logs/voice-commands.txt`;
const STATE_FILE = `${ROOT}/logs/voice-poller-state.json`;
const QUEUE_FILE = `${ROOT}/logs/voice-queue.jsonl`;
const POLL_INTERVAL_MS = 10_000; // 10 seconds

let state = { lastLine: 0 };

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error(`[poller] failed to load state: ${err.message}`);
  }
}

function saveState() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error(`[poller] failed to save state: ${err.message}`);
  }
}

function processNewCommands() {
  if (!fs.existsSync(COMMANDS_FILE)) return;

  const lines = fs.readFileSync(COMMANDS_FILE, 'utf-8').trim().split('\n').filter(Boolean);
  const newLines = lines.slice(state.lastLine);

  if (newLines.length === 0) return;

  console.log(`[poller] found ${newLines.length} new command(s)`);

  for (const line of newLines) {
    // Parse: [timestamp] text
    const match = line.match(/^\[(.+?)\]\s*(.+)$/);
    if (!match) continue;

    const [, timestamp, text] = match;
    const entry = {
      ts: timestamp,
      text: text.trim(),
      processedAt: new Date().toISOString(),
    };

    // Append to queue
    fs.appendFileSync(QUEUE_FILE, JSON.stringify(entry) + '\n');
    console.log(`[poller] queued: "${text.slice(0, 60)}..."`);
  }

  state.lastLine = lines.length;
  saveState();
}

function poll() {
  try {
    processNewCommands();
  } catch (err) {
    console.error(`[poller] error: ${err.message}`);
  }
}

console.log(`[poller] starting (interval: ${POLL_INTERVAL_MS}ms)`);
console.log(`[poller] watching: ${COMMANDS_FILE}`);
console.log(`[poller] queue: ${QUEUE_FILE}`);

loadState();
setInterval(poll, POLL_INTERVAL_MS);
poll(); // initial check
