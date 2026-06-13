# jelly-telegram

> Telegram-native trading alerts, portfolio notifications, and automated bot workflows powered by Claude Code.

**GitHub:** [github.com/jelly-chain/Extension/jelly-telegram](https://github.com/jelly-chain/Extension/jelly-telegram)

---

## What is this?

jelly-telegram is a Claude Code extension that:
- Installs **5 skills** covering Telegram Bot API, price alerts, and trading integrations
- Loads **5 agent templates** for price alerting, trade notifications, community intelligence, and signal broadcasting
- Includes `CLAUDE.md` — session memory pre-loaded with skill locations and Telegram key references
- Works with Anthropic paid models or free/cheap OpenRouter models

---

## Skills included

| Skill | What it covers |
|-------|---------------|
| `telegram-skill` | Telegram Bot API — send messages, images, polls, inline keyboards, alerts |
| `coingecko-skill` | Token price data for price alert triggers |
| `dexscreener-skill` | New pair discovery and trending tokens for signal feeds |
| `birdeye-skill` | Multi-chain whale activity for smart money alert feeds |
| `prediction-skill` | Jelly Score heuristics for prediction signal broadcasts |

## Agents included

| Agent | What it does |
|-------|-------------|
| `price-alert-bot` | Monitor token prices and send Telegram alerts at target levels |
| `whale-alert-broadcaster` | Detect large on-chain moves and broadcast to Telegram channel |
| `signal-broadcaster` | Package and send trading signals with entry/exit/stop to Telegram |
| `community-intel-scraper` | Monitor crypto Telegram groups for alpha and sentiment |
| `portfolio-notifier` | Daily P&L summary and position updates sent to Telegram |

---

## Quick Start

```bash
git clone https://github.com/jelly-chain/Extension/jelly-telegram
git clone https://github.com/jelly-chain/Extension/jelly-telegram-skills
git clone https://github.com/jelly-chain/Extension/jelly-telegram-agents

cd jelly-telegram
bash setup.sh
bash jelly-telegram.sh
```

## Windows

```powershell
.\setup.ps1
.\jelly-telegram.ps1
```

## Keys needed

| Key | Source |
|-----|--------|
| `TELEGRAM_BOT_TOKEN` | @BotFather on Telegram → /newbot |
| `TELEGRAM_CHAT_ID` | your channel or group chat ID |
| `BIRDEYE_API_KEY` | birdeye.so |

## Create a Telegram bot (30 seconds)

1. Open Telegram → search `@BotFather`
2. Send `/newbot` → follow prompts → get your `TELEGRAM_BOT_TOKEN`
3. Add your bot to a channel as admin
4. Get the chat ID: send a message → visit `https://api.telegram.org/bot<TOKEN>/getUpdates`

## Example prompts

```
"Send a Telegram alert when ETH drops below $3000"
"Broadcast my current portfolio P&L to the Telegram channel"
"Monitor wallet 0x... and send a Telegram message when they move > $100k"
"Send a daily morning summary of top 5 movers to my Telegram channel"
"Set up a price alert for BTC at $100,000 and notify me on Telegram"
"Post this trading signal to my Telegram channel with proper formatting"
```
