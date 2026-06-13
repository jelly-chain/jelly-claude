# Jelly-Social Skills

> 6 skills for the Jelly-Social AI agent — X/Twitter, Reddit, Discord, Telegram, LinkedIn, and TikTok.

**GitHub:** [github.com/jelly-chain/Extension/jelly-social-skills](https://github.com/jelly-chain/Extension/jelly-social-skills)

Skills teach [Claude Code](https://github.com/anthropics/claude-code) how to interact with social media platforms and messaging APIs. Install them and the agent gains instant expertise.

---

## Install everything at once

```bash
bash install-all.sh       # Mac / Linux
.\install-all.ps1         # Windows PowerShell
```

## Install a single skill

```bash
bash skills/twitter-skill/install.sh
```

---

## Skill list (6 skills)

| Skill | Platform | Description |
|-------|----------|-------------|
| `twitter-skill` | X (Twitter) | Post tweets, threads, search mentions, upload media via API v2 |
| `reddit-skill` | Reddit | Browse subreddits, search posts, submit content, monitor communities |
| `discord-skill` | Discord | Bot messages, embeds, webhooks, slash commands, role management |
| `telegram-skill` | Telegram | Send messages, images, polls, inline keyboards to users and groups |
| `linkedin-skill` | LinkedIn | Post text updates, share articles, upload images via API v2 |
| `tiktok-skill` | TikTok | Upload and publish videos, research public content via API v2 |

---

## Skill structure

Each skill follows this layout:
```
skills/<skill-name>/
  SKILL.md        ← knowledge base Claude Code reads
  install.sh      ← Mac/Linux installer
  install.ps1     ← Windows installer
  README.md       ← docs, example prompts, required keys
  .keys.example   ← key template (actual .keys file is gitignored)
```

---

## Adding new skills

1. Create a folder under `skills/your-skill-name/`
2. Add `SKILL.md`, `install.sh`, `install.ps1`, `README.md`, `.keys.example`
3. The installer pattern is the same for all skills — copy from any existing one
4. Send a PR to [github.com/jelly-chain/Extension/jelly-social-skills](https://github.com/jelly-chain/Extension/jelly-social-skills)

---

## License

MIT
