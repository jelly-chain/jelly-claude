#!/usr/bin/env node
/**
 * Watches logs/voice-transcript.jsonl for new lines, filters for actual speech,
 * and pipes them to Claude Code's stdin (if CLAUDE_PID is set).
 *
 * Usage (from start-buddy.sh):
 *   export CLAUDE_PID=$$
 *   node core/voice-to-claude-bridge.mjs &
 */

import fs from 'node:fs';
import { spawn } from 'node:child_process';

const TRANSCRIPT_PATH = 'logs/voice-transcript.jsonl';
const DEBOUNCE_MS = 1500; // wait 1.5s after last speech before sending
const NOISE_PATTERNS = [
  /^\[.*\]$/,           // [BLANK_AUDIO], [ Silence ]
  /^\(.*\)$/,           // (keyboard clicking)
  /^silence$/i,
  /^blank/i,
];

let lastLine = ''; // last line content
let debounceTimer = null;
let buffer = [];

function isNoise(text) {
  if (!text || text.trim().length < 3) return true;
  return NOISE_PATTERNS.some(p => p.test(text.trim()));
}

function sendToClaudeStdin(text) {
  // Write to a command file that Buddy can poll
  const cmd = `logs/voice-commands.txt`;
  const line = `[${new Date().toISOString()}] ${text}\n`;
  fs.appendFileSync(cmd, line);
  console.log(`[bridge] voice → "${text.slice(0, 60)}..."`);

  // Also trigger macOS notification so you know speech was captured
  try {
    spawn('osascript', ['-e', `display notification "${text.slice(0, 100)}" with title "🎤 Voice captured"`]);
  } catch {}
}

function processBuffer() {
  if (buffer.length === 0) return;
  const combined = buffer.join(' ').trim();
  if (!isNoise(combined)) {
    sendToClaudeStdin(combined);
  }
  buffer = [];
}

function watchTranscript() {
  if (!fs.existsSync(TRANSCRIPT_PATH)) {
    console.error(`[bridge] ${TRANSCRIPT_PATH} not found, waiting...`);
    setTimeout(watchTranscript, 2000);
    return;
  }

  const watcher = fs.watch(TRANSCRIPT_PATH, (eventType) => {
    if (eventType !== 'change') return;

    const lines = fs.readFileSync(TRANSCRIPT_PATH, 'utf-8').trim().split('\n');
    const newLine = lines[lines.length - 1];
    if (!newLine || newLine === lastLine) return;
    lastLine = newLine;

    let parsed;
    try {
      parsed = JSON.parse(newLine);
    } catch {
      return;
    }

    const text = parsed.text?.trim();
    if (!text || isNoise(text)) return;

    // Skip duplicate consecutive text
if (text !== buffer.slice(-1)[0]) {
  buffer.push(text);
}

    // Debounce: wait for pause in speech
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(processBuffer, DEBOUNCE_MS);
  });

  console.log(`[bridge] watching ${TRANSCRIPT_PATH}`);
}

watchTranscript();
