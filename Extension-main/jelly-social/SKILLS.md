# Jelly-Social — Skills Reference (6 skills)

Skills are installed at `~/.claude/skills/<skill-name>/SKILL.md`.
After `setup.sh` / `install-all.sh` runs, all 6 are available automatically.

---

## twitter-skill
**Platform:** X (Twitter)
**Purpose:** X API v2 — post tweets, threads, and media; search mentions; like and retweet; schedule content via cron.
**Required keys:** `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_BEARER_TOKEN`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_SECRET`
**Use when:** Posting to X, searching tweets, building scheduled content pipelines.

---

## reddit-skill
**Platform:** Reddit
**Purpose:** Reddit API (OAuth2 via snoowrap) — browse subreddits, search posts, submit content, monitor communities for keywords.
**Required keys:** `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USERNAME`, `REDDIT_PASSWORD`
**Use when:** Researching Reddit sentiment, finding trending discussions, or automating Reddit submissions.

---

## discord-skill
**Platform:** Discord
**Purpose:** Discord Bot API (discord.js v14) — send messages and embeds, manage roles, handle slash commands, bulk-delete, webhook notifications.
**Required keys:** `DISCORD_BOT_TOKEN`, `DISCORD_WEBHOOK_URL` (optional)
**Use when:** Managing a Discord server, sending alerts, building bots, or moderating channels.

---

## telegram-skill
**Platform:** Telegram
**Purpose:** Telegram Bot API (node-telegram-bot-api) — send messages, images, documents, polls, inline keyboards to users and groups.
**Required keys:** `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
**Use when:** Sending alerts and notifications, building interactive Telegram bots, or scheduling broadcasts.

---

## linkedin-skill
**Platform:** LinkedIn
**Purpose:** LinkedIn API v2 — post text updates, share articles, upload images, fetch profile and follower data.
**Required keys:** `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_ACCESS_TOKEN`
**Use when:** Publishing professional content, sharing links, or monitoring your LinkedIn presence.

---

## tiktok-skill
**Platform:** TikTok
**Purpose:** TikTok API v2 — upload and publish videos, check publish status, search public content via Research API.
**Required keys:** `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_ACCESS_TOKEN`
**Use when:** Publishing TikTok videos programmatically or researching trending content.
