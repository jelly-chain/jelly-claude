# Jelly-Social

> Multi-platform social media AI agent powered by Claude Code — X/Twitter, Reddit, Discord, Telegram, LinkedIn, and TikTok.

**GitHub:** [github.com/jelly-chain/Extension/jelly-social](https://github.com/jelly-chain/Extension/jelly-social)

---

## What is this?

Jelly-Social is a launch wrapper for [Claude Code](https://github.com/anthropics/claude-code) that:
- Installs **6 skills** covering every major social platform API
- Loads **6 agent templates** for content scheduling, community research, moderation, broadcasting, and trend discovery
- Includes `CLAUDE.md` — session memory that pre-loads all skill paths and API key locations so Claude starts every session already oriented
- Works with Anthropic paid models or free/cheap OpenRouter models

---

## Prerequisites

| Tool | Version | Get it |
|------|---------|--------|
| Node.js | v18+ | [nodejs.org](https://nodejs.org) |
| npm | v9+ | Comes with Node |
| Git | any | [git-scm.com](https://git-scm.com) |

---

## Quick Start

### Mac / Linux

```bash
# 1. Clone the three Jelly-Social repos into the same parent folder
git clone https://github.com/jelly-chain/Extension/jelly-social
git clone https://github.com/jelly-chain/Extension/jelly-social-skills
git clone https://github.com/jelly-chain/Extension/jelly-social-agents

# 2. Run the setup wizard (one time only)
cd jelly-social
bash setup.sh

# 3. Add your API key to .env
nano .env

# 4. Launch the agent
bash jelly-social.sh
```

### Windows (PowerShell)

```powershell
git clone https://github.com/jelly-chain/Extension/jelly-social
git clone https://github.com/jelly-chain/Extension/jelly-social-skills
git clone https://github.com/jelly-chain/Extension/jelly-social-agents

cd jelly-social
.\setup.ps1
.\jelly-social.ps1
```

---

## API Key — which one to use?

### Option A: Anthropic (recommended)
```
ANTHROPIC_API_KEY=sk-ant-...
```
Get one at [console.anthropic.com](https://console.anthropic.com)

### Option B: OpenRouter (free/low-cost)
```
OPENROUTER_API_KEY=sk-or-...
```
Get one at [openrouter.ai/keys](https://openrouter.ai/keys)

---

## Skills

| Skill | Platform | Required keys |
|-------|----------|---------------|
| `twitter-skill` | X (Twitter) | `TWITTER_API_KEY`, `TWITTER_BEARER_TOKEN` |
| `reddit-skill` | Reddit | `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET` |
| `discord-skill` | Discord | `DISCORD_BOT_TOKEN` |
| `telegram-skill` | Telegram | `TELEGRAM_BOT_TOKEN` |
| `linkedin-skill` | LinkedIn | `LINKEDIN_ACCESS_TOKEN` |
| `tiktok-skill` | TikTok | `TIKTOK_CLIENT_KEY`, `TIKTOK_ACCESS_TOKEN` |

---

## Agents

| Agent | What it does |
|-------|-------------|
| `tweet-scheduler` | Post tweets, threads, and scheduled content on X |
| `reddit-researcher` | Browse, search, and monitor Reddit communities |
| `discord-moderator` | Manage Discord servers, send embeds, handle moderation |
| `telegram-broadcaster` | Send alerts, broadcasts, and interactive bots on Telegram |
| `linkedin-poster` | Post professional updates and articles on LinkedIn |
| `viral-hunter` | Discover trending content across all platforms |

---

## Related repos

| Repo | Purpose |
|------|---------|
| [jelly-chain/jelly-social](https://github.com/jelly-chain/Extension/jelly-social) | This repo — launcher + setup |
| [jelly-chain/jelly-social-skills](https://github.com/jelly-chain/Extension/jelly-social-skills) | 6 skills (Twitter, Reddit, Discord, Telegram, LinkedIn, TikTok) |
| [jelly-chain/jelly-social-agents](https://github.com/jelly-chain/Extension/jelly-social-agents) | 6 agent templates |

---

## License

MIT — see [LICENSE](LICENSE)
