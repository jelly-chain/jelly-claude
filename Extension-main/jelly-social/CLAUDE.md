# Jelly-Social — Agent Context

Multi-platform social media AI agent for X/Twitter, Reddit, Discord, Telegram, LinkedIn, and TikTok.

---

## API Keys

All keys are stored at `~/.jelly-social/.keys`. Load with:
```javascript
import { readFileSync } from "fs";
import { homedir } from "os";
const keys = Object.fromEntries(
  readFileSync(`${homedir()}/.jelly-social/.keys`, "utf8")
    .split("\n").filter(l => l.includes("="))
    .map(l => l.split("=").map(s => s.trim()))
);
```

Key names in `.keys`:
- `TWITTER_API_KEY` / `TWITTER_API_SECRET` / `TWITTER_BEARER_TOKEN` / `TWITTER_ACCESS_TOKEN` / `TWITTER_ACCESS_SECRET`
- `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` / `REDDIT_USERNAME` / `REDDIT_PASSWORD`
- `DISCORD_BOT_TOKEN` / `DISCORD_WEBHOOK_URL` / `DISCORD_APP_ID` / `DISCORD_GUILD_ID`
- `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`
- `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` / `LINKEDIN_ACCESS_TOKEN`
- `TIKTOK_CLIENT_KEY` / `TIKTOK_CLIENT_SECRET` / `TIKTOK_ACCESS_TOKEN` / `TIKTOK_REFRESH_TOKEN`

---

## Skills Location

Skills are installed at `~/.claude/skills/<skill-name>/SKILL.md`.

Available skills (after install-all.sh) — 6 total:
- `twitter-skill` — X (Twitter) API v2: post, search, thread, schedule, upload media
- `reddit-skill` — Reddit API: browse subreddits, search, submit posts, monitor communities
- `discord-skill` — Discord Bot API: messages, embeds, webhooks, slash commands, moderation
- `telegram-skill` — Telegram Bot API: send messages, images, polls, inline keyboards
- `linkedin-skill` — LinkedIn API v2: post updates, share articles, upload images
- `tiktok-skill` — TikTok API v2: upload videos, check status, Research API search

For full API reference → see each `~/.claude/skills/<skill-name>/SKILL.md`

---

## Agent Templates

Agents are at `~/.claude/agents/<agent-name>.md`. Invoke inside Claude Code with:
```
/agent <agent-name>
```

All 6 agents:
| Agent | Use case |
|-------|----------|
| `tweet-scheduler` | Post tweets, threads, and scheduled X content |
| `reddit-researcher` | Find, analyse, and monitor Reddit discussions |
| `discord-moderator` | Discord server management, messaging, and moderation |
| `telegram-broadcaster` | Telegram messaging, alerts, and broadcast automation |
| `linkedin-poster` | LinkedIn professional content publishing |
| `viral-hunter` | Cross-platform trend discovery and viral content detection |

For full descriptions and example prompts → see `AGENTS.md` in this directory.

---

## Platform Quick Reference

| Platform | API Docs | Auth method |
|----------|----------|-------------|
| X (Twitter) | [developer.x.com](https://developer.x.com) | OAuth 1.0a (write) / Bearer Token (read) |
| Reddit | [reddit.com/dev/api](https://www.reddit.com/dev/api) | OAuth2 password flow (script apps) |
| Discord | [discord.com/developers/docs](https://discord.com/developers/docs) | Bot Token |
| Telegram | [core.telegram.org/bots/api](https://core.telegram.org/bots/api) | Bot Token from BotFather |
| LinkedIn | [learn.microsoft.com/linkedin](https://learn.microsoft.com/en-us/linkedin/) | OAuth 2.0 3-legged |
| TikTok | [developers.tiktok.com](https://developers.tiktok.com) | OAuth 2.0 3-legged |

---

## Security Rules

- **Never log or print API keys or tokens** — not to console, not to files, not in responses
- API key files are gitignored — never commit them
- Always confirm message content and target audience before sending
- For moderation actions (deleting messages, banning users), require explicit "CONFIRM"
- LinkedIn and TikTok access tokens expire — check expiry before making API calls
