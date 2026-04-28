#!/usr/bin/env node
/**
 * Voice Response Handler - DELETED (not needed)
 *
 * Commands now flow directly from voice-queue.jsonl to Claude CLI.
 * The voice-auto-poller.sh handles displaying commands in the terminal,
 * and the user manually confirms them.
 *
 * For true automation, implement a separate agent that:
 * 1. Reads logs/voice-queue.jsonl
 * 2. Calls the Claude API directly with the command text
 * 3. Streams responses back via TTS
 *
 * That's beyond the scope of "fixing the voice loop" - it's a new feature.
 */

console.log('[response-handler] This handler is deprecated. Voice commands appear in voice-queue.jsonl.');
console.log('[response-handler] To process them automatically, build a separate agent that calls Claude API.');
process.exit(0);
