# Telegram Skill

Teach Claude to send Telegram notifications for trade signals, alerts, and reports.

## Key Concepts

- Bot API: simple HTTP API for sending messages
- Chat types: private chat, group, supergroup, channel
- Message formats: plain text, Markdown, HTML
- Rate limits: 30 messages/second globally, 1 message/second per chat

## API Endpoints

- Base: `https://api.telegram.org/bot<BOT_TOKEN>`
- Send: `POST /sendMessage`
- Photo: `POST /sendPhoto`

## Required Keys

```
TELEGRAM_BOT_TOKEN=<token>  # create via @BotFather on Telegram
TELEGRAM_CHAT_ID=<id>       # get via @userinfobot — can be negative for groups
```

## Message Templates

```
# Trade signal
*🎯 Jelly Signal*
Token: SOL/USDC
Score: 85/100 (strong)
Edge: 72/100
Action: BUY 0.5 SOL
Entry: $185.20

# P&L update
*📊 Daily P&L*
Trades: 12
Win rate: 67%
Net: +$142.50
```

## Common Operations

```
/telegram test            — send a test message
/telegram alert <text>    — send a plain text alert
/telegram signal <data>   — format and send a trade signal
/telegram report          — send daily performance report
```
