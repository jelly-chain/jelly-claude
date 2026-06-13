# Telegram Skill — Telegram Bot API (node-telegram-bot-api)

## Overview
The Telegram Bot API is one of the simplest and most powerful messaging APIs available. Bots can send messages, images, files, and polls to users and groups, and receive messages via webhook or long-polling. `node-telegram-bot-api` is the most popular Node.js wrapper.

## What you need
1. **Telegram account** — [telegram.org](https://telegram.org)
2. **Bot Token** — open [@BotFather](https://t.me/BotFather) → `/newbot` → follow prompts → copy token
3. **Chat ID** — the numeric ID of the user or group you want to message (use [@userinfobot](https://t.me/userinfobot) or the `getUpdates` endpoint)

## Install
```bash
npm install node-telegram-bot-api
npm install -D @types/node-telegram-bot-api
```

## Setup
```typescript
import TelegramBot from 'node-telegram-bot-api';

// Polling mode (simple, no server needed)
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: true });

// Webhook mode (production)
// const bot = new TelegramBot(token, { webHook: { port: 8443 } });
// bot.setWebHook(`https://yourdomain.com/bot${token}`);
```

## Send a text message
```typescript
await bot.sendMessage(process.env.TELEGRAM_CHAT_ID!, 'Hello from Jelly-Social! 🌊');

// With Markdown formatting
await bot.sendMessage(chatId, '*Bold* and _italic_ and `code`', { parse_mode: 'Markdown' });

// With HTML formatting
await bot.sendMessage(chatId, '<b>Alert:</b> SOL price crossed $150', { parse_mode: 'HTML' });
```

## Send an image
```typescript
import fs from 'fs';

// From URL
await bot.sendPhoto(chatId, 'https://example.com/chart.png', { caption: 'Daily chart 📊' });

// From file
await bot.sendPhoto(chatId, fs.createReadStream('./chart.png'));
```

## Send a document
```typescript
await bot.sendDocument(chatId, fs.createReadStream('./report.pdf'), {}, {
  filename: 'daily-report.pdf',
  contentType: 'application/pdf',
});
```

## Send a poll
```typescript
await bot.sendPoll(chatId, 'What should we trade next?', ['SOL', 'BTC', 'ETH', 'Nothing'], {
  is_anonymous: false,
  allows_multiple_answers: false,
});
```

## Reply to messages
```typescript
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text   = msg.text ?? '';

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Welcome! I am your Jelly-Social bot 🪼');
  }

  if (text.startsWith('/price')) {
    const token = text.split(' ')[1] ?? 'SOL';
    await bot.sendMessage(chatId, `${token}: $152.30`);
  }
});
```

## Inline keyboard buttons
```typescript
import { InlineKeyboardMarkup } from 'node-telegram-bot-api';

const keyboard: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      { text: '📊 Price', callback_data: 'price_sol' },
      { text: '🔔 Alert', callback_data: 'set_alert' },
    ],
    [{ text: '❌ Cancel', callback_data: 'cancel' }],
  ],
};

await bot.sendMessage(chatId, 'Choose an action:', { reply_markup: keyboard });

bot.on('callback_query', async (query) => {
  await bot.answerCallbackQuery(query.id);
  if (query.data === 'price_sol') {
    await bot.sendMessage(query.message!.chat.id, 'SOL: $152.30');
  }
});
```

## Broadcast to multiple chats
```typescript
const chatIds = ['CHAT_ID_1', 'CHAT_ID_2', 'GROUP_ID'];
const message = '🚨 Important update: market volatility detected!';

for (const id of chatIds) {
  await bot.sendMessage(id, message);
  await new Promise(r => setTimeout(r, 100)); // avoid hitting rate limits
}
```

## Schedule messages with cron
```typescript
import cron from 'node-cron';

cron.schedule('0 8 * * *', async () => {
  await bot.sendMessage(chatId, '☀️ Good morning! Daily briefing:\n\n...');
});
```

## Get updates manually (find your chat ID)
```typescript
const updates = await bot.getUpdates();
updates.forEach(u => console.log('Chat ID:', u.message?.chat.id, '|', u.message?.text));
```

## Rate limits
- 30 messages per second globally
- 1 message per second to the same chat
- Use delays between bulk sends

## Key names (store in ~/.jelly-social/.keys)
```
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```
