/**
 * core/tg-bridge.mjs
 *
 * Telegram ↔ Claude Code bridge.
 * Reads TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID from the environment.
 *
 * Usage:
 *   import { startTelegramBridge } from './core/tg-bridge.mjs';
 *   const bot = await startTelegramBridge(claudeChildProcess, { mode, models });
 *
 * Security: only responds to the single TELEGRAM_CHAT_ID configured in .env.
 */

import TelegramBot from 'node-telegram-bot-api';

const CHUNK_SIZE = 4000;  // Telegram hard limit is 4096; leave margin

/** Strip ANSI escape codes so terminal colours don't corrupt Telegram messages. */
function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*[A-Za-z]/g, '').replace(/\x1B\][^\x07]*\x07/g, '');
}

/** Escape characters that have special meaning inside Telegram HTML mode. */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Convert a plain-text chunk (possibly containing ```fenced blocks```) into
 * Telegram HTML with code rendered as <pre> elements.
 * Falls back to the original string if no fences are found.
 */
function toHtml(text) {
  // Split on fenced code blocks (``` ... ```)
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      // Strip the opening fence + optional language tag
      const inner = part.slice(3, -3).replace(/^\w*\n/, '');
      return `<pre>${escapeHtml(inner.trim())}</pre>`;
    }
    return escapeHtml(part);
  }).join('');
}

/**
 * Split text into chunks ≤ CHUNK_SIZE, trying to break at newlines.
 */
function splitText(text) {
  if (text.length <= CHUNK_SIZE) return [text];
  const chunks = [];
  let remaining = text;
  while (remaining.length > CHUNK_SIZE) {
    let idx = remaining.lastIndexOf('\n', CHUNK_SIZE);
    if (idx < 200) idx = CHUNK_SIZE;
    chunks.push(remaining.slice(0, idx));
    remaining = remaining.slice(idx).trimStart();
  }
  if (remaining.trim()) chunks.push(remaining);
  return chunks;
}

/**
 * Send a (potentially long) message to Telegram.
 * Code fences are rendered as HTML <pre> blocks.
 * Falls back to plain text if the HTML send fails.
 */
async function sendMessage(bot, chatId, text) {
  const cleaned = stripAnsi(text).trim();
  if (!cleaned) return;

  const chunks = splitText(cleaned);
  for (const chunk of chunks) {
    const hasCodeFence = /```[\s\S]*?```/.test(chunk);
    if (hasCodeFence) {
      try {
        await bot.sendMessage(chatId, toHtml(chunk), { parse_mode: 'HTML' });
        continue;
      } catch {
        // HTML send failed — fall through to plain text
      }
    }
    await bot.sendMessage(chatId, chunk);
  }
}

/**
 * Start the Telegram bridge.
 *
 * @param {import('node:child_process').ChildProcess} claudeProcess
 * @param {{ mode?: string, models?: { opus?: string, sonnet?: string, haiku?: string } }} [opts]
 * @returns {Promise<TelegramBot>}
 */
export async function startTelegramBridge(claudeProcess, opts = {}) {
  const token  = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token)  throw new Error('TELEGRAM_BOT_TOKEN is not set in .env');
  if (!chatId) throw new Error('TELEGRAM_CHAT_ID is not set in .env');

  const startTime    = Date.now();
  const MAX_RETRY    = 5;
  // retryCount is declared outside initBot and is NEVER reset inside it,
  // so it accumulates across reconnect attempts and the cap is enforced correctly.
  let retryCount     = 0;
  // isReconnecting prevents overlapping initBot calls when multiple polling_error
  // events fire in quick succession before the delayed restart takes effect.
  let isReconnecting = false;
  let bot;

  // ── Output buffering ──────────────────────────────────────────────────────
  let outputBuffer = '';
  let flushTimer   = null;

  function scheduleFlush() {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(async () => {
      const toSend = outputBuffer.trim();
      outputBuffer = '';
      if (toSend && bot) {
        await sendMessage(bot, chatId, toSend).catch(console.error);
      }
    }, 300);
  }

  if (claudeProcess.stdout) {
    claudeProcess.stdout.on('data', (chunk) => {
      outputBuffer += chunk.toString();
      scheduleFlush();
    });
  }

  claudeProcess.on('exit', () => {
    if (flushTimer) clearTimeout(flushTimer);
    const remaining = outputBuffer.trim();
    outputBuffer = '';
    const finish = async () => {
      if (remaining && bot) await sendMessage(bot, chatId, remaining).catch(() => {});
      if (bot) {
        await sendMessage(bot, chatId, '🪼 Jelly-Claude session ended.').catch(() => {});
        setTimeout(() => bot.stopPolling().catch(() => {}), 1000);
      }
    };
    finish();
  });

  // ── Bot + polling ─────────────────────────────────────────────────────────
  async function initBot() {
    bot = new TelegramBot(token, { polling: true });

    bot.on('message', async (msg) => {
      // Security gate — single authorised chat only
      if (String(msg.chat.id) !== String(chatId)) {
        bot.sendMessage(msg.chat.id, '⛔ Unauthorized. This is a private Jelly-Claude instance.').catch(() => {});
        return;
      }

      // Ignore non-text payloads (photos, stickers, voice, etc.) from the
      // authorised chat — they would otherwise forward an empty line to Claude.
      if (!msg.text) return;

      const text = msg.text.trim();

      if (text === '/status') {
        const uptime    = Math.floor((Date.now() - startTime) / 1000);
        const mode      = opts.mode ?? 'unknown';
        const modelLine = opts.models
          ? `\nOpus:   ${opts.models.opus   ?? 'default'}\nSonnet: ${opts.models.sonnet ?? 'default'}\nHaiku:  ${opts.models.haiku  ?? 'default'}`
          : '';
        const statusHtml = `<b>🪼 Jelly-Claude Status</b>\nMode: ${escapeHtml(mode)}${escapeHtml(modelLine)}\nUptime: ${uptime}s`;
        bot.sendMessage(chatId, statusHtml, { parse_mode: 'HTML' }).catch(() =>
          bot.sendMessage(chatId, `Jelly-Claude Status\nMode: ${mode}${modelLine}\nUptime: ${uptime}s`).catch(() => {})
        );
        return;
      }

      if (text === '/stop') {
        await sendMessage(bot, chatId, '🛑 Shutting down Jelly-Claude…');
        claudeProcess.kill('SIGTERM');
        setTimeout(() => process.exit(0), 2000);
        return;
      }

      // Forward all other text to Claude's stdin
      if (claudeProcess.stdin && !claudeProcess.stdin.destroyed) {
        claudeProcess.stdin.write(text + '\n', 'utf8');
      }
    });

    bot.on('polling_error', async (err) => {
      // Single-flight guard: ignore duplicate error events while a reconnect is
      // already scheduled, preventing overlapping bot instances.
      if (isReconnecting) return;

      // retryCount is NOT reset here — it accumulates so MAX_RETRY is enforced
      if (retryCount >= MAX_RETRY) {
        console.error('[tg-bridge] Fatal: max retries reached, giving up:', err.message);
        return;
      }

      isReconnecting = true;
      retryCount++;
      const delay = Math.min(1000 * 2 ** (retryCount - 1), 16_000);
      console.error(`[tg-bridge] Polling error (retry ${retryCount}/${MAX_RETRY} in ${delay}ms):`, err.message);
      try {
        await bot.sendMessage(chatId, `⚠️ Jelly disconnected — reconnecting… (attempt ${retryCount}/${MAX_RETRY})`);
      } catch { /* ignore if TG itself is down */ }
      await bot.stopPolling().catch(() => {});
      setTimeout(() => {
        isReconnecting = false;
        initBot();
      }, delay);
    });
  }

  await initBot();
  return bot;
}
