#!/usr/bin/env node
// core/auto-speak.mjs — Automatically speak Claude Code assistant responses
// Usage: Launch Claude Code and pipe through this script
//   claude ... | node core/auto-speak.mjs

import { createInterface } from 'node:readline';
import { speak } from './voice.mjs';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const STATE_FILE = join(process.cwd(), 'logs', 'voice-state.json');

function getAutoSpeakState() {
  try {
    if (existsSync(STATE_FILE)) {
      const state = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
      return state.autoSpeak === true;
    }
  } catch {}
  return false;
}

let buffer = '';
let inAssistantMessage = false;

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  // Pass through immediately to preserve real-time output
  console.log(line);

  if (!getAutoSpeakState()) return;

  // Detect assistant message blocks
  if (line.includes('Assistant:') || line.includes('assistant:')) {
    inAssistantMessage = true;
    buffer = '';
    return;
  }

  // Detect end of assistant message (blank line or new section)
  if (inAssistantMessage && (line.trim() === '' || line.startsWith('Human:') || line.startsWith('Tool:'))) {
    if (buffer.trim().length > 0) {
      // Clean up markdown, code blocks, and formatting
      const cleaned = buffer
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`[^`]+`/g, '') // Remove inline code
        .replace(/\[.*?\]\(.*?\)/g, '') // Remove markdown links
        .replace(/[*_~#]/g, '') // Remove markdown formatting
        .replace(/\s+/g, ' ') // Collapse whitespace
        .trim();

      if (cleaned.length > 0 && cleaned.length < 500) {
        // Speak in background, don't block output
        speak(cleaned).catch(() => {}); // Ignore TTS errors
      }
    }
    buffer = '';
    inAssistantMessage = false;
    return;
  }

  // Accumulate assistant message text
  if (inAssistantMessage) {
    buffer += line + ' ';
  }
});

rl.on('close', () => {
  // Speak any remaining buffered text
  if (buffer.trim().length > 0 && getAutoSpeakState()) {
    const cleaned = buffer.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '').trim();
    if (cleaned.length > 0 && cleaned.length < 500) {
      speak(cleaned).catch(() => {});
    }
  }
});
