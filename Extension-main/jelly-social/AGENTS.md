# Jelly-Social — Agents Reference (6 agents)

Agents are installed at `~/.claude/agents/<agent-name>.md`.
Invoke inside Claude Code with `/agent <agent-name>`.

---

## tweet-scheduler
**Purpose:** Craft, schedule, and post tweets and threads on X — single posts, numbered threads, scheduled content, media uploads, and engagement tracking.
**Required skills:** `twitter-skill`
**Required keys:** `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_BEARER_TOKEN`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_SECRET`
**Example prompts:**
- "Post a tweet: 'Just shipped something new! 🚀'"
- "Thread a 5-part explainer about prediction markets"
- "Schedule a daily tweet at 9am UTC for the next 7 days"
- "Search for mentions of my username from the last 24 hours"

---

## reddit-researcher
**Purpose:** Browse, search, and monitor Reddit communities — find trending posts, analyse sentiment, track keywords, and submit content.
**Required skills:** `reddit-skill`
**Required keys:** `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USERNAME`, `REDDIT_PASSWORD`
**Example prompts:**
- "What are people saying about Solana on Reddit this week?"
- "Show me the top 10 posts in r/SolanaNews"
- "Monitor r/CryptoMarkets for mentions of 'ETF' and alert me"
- "Post to r/test: 'Hello from Jelly-Social!'"

---

## discord-moderator
**Purpose:** Manage Discord servers — send messages and embeds, handle moderation, manage roles, register slash commands, post webhook alerts.
**Required skills:** `discord-skill`
**Required keys:** `DISCORD_BOT_TOKEN`, `DISCORD_WEBHOOK_URL`, `DISCORD_APP_ID`, `DISCORD_GUILD_ID`
**Example prompts:**
- "Send a market update embed to #alerts"
- "Delete the last 20 messages in #general"
- "Add the 'Verified' role to user @username"
- "Register a /price slash command that returns SOL price"

---

## telegram-broadcaster
**Purpose:** Send messages, images, polls, and alerts to Telegram users and groups — supports inline keyboards, cron scheduling, and bulk broadcasting.
**Required skills:** `telegram-skill`
**Required keys:** `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
**Example prompts:**
- "Send a Telegram alert: 'Price target hit! 🎯'"
- "Broadcast this update to all 5 of my Telegram groups"
- "Set up a daily 8am briefing to my channel"
- "Create a menu with buttons: Price, Portfolio, Alert"

---

## linkedin-poster
**Purpose:** Post professional updates, share articles, and upload images on LinkedIn — manages OAuth tokens and follows platform best practices.
**Required skills:** `linkedin-skill`
**Required keys:** `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_ACCESS_TOKEN`
**Example prompts:**
- "Post a LinkedIn update about our new product launch"
- "Share this article with a professional comment: [URL]"
- "What is my current follower count?"
- "Draft a thought leadership post about AI agents"

---

## viral-hunter
**Purpose:** Discover trending content and viral posts across X/Twitter, Reddit, and TikTok — surfaces high-velocity content before it peaks.
**Required skills:** `twitter-skill`, `reddit-skill`, `tiktok-skill`
**Required keys:** `TWITTER_BEARER_TOKEN`, `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `TIKTOK_ACCESS_TOKEN`
**Example prompts:**
- "What's trending about AI agents across Twitter and Reddit right now?"
- "Find the top 5 viral TikToks about Web3 this week"
- "What hashtags are gaining momentum on X in the crypto space?"
- "Find influencers under 10K followers posting about prediction markets"
