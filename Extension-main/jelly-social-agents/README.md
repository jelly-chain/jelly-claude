# Jelly-Social Agents

> 6 ready-to-use agent templates for the Jelly-Social multi-platform social media AI agent.

**GitHub:** [github.com/jelly-chain/Extension/jelly-social-agents](https://github.com/jelly-chain/Extension/jelly-social-agents)

Each agent is a pre-configured Claude Code sub-agent you can summon with the `/agent` command. Agents come pre-loaded with the right skills, prompts, and workflows for specific social media tasks.

---

## Install all agents

```bash
bash install-all.sh       # Mac / Linux
.\install-all.ps1         # Windows PowerShell
```

## Install one agent

```bash
# Manually copy
cp agents/tweet-scheduler/agent.md ~/.claude/agents/tweet-scheduler.md
```

## Use an agent

Inside Claude Code:
```
/agent tweet-scheduler
/agent viral-hunter
/agent discord-moderator
```

---

## Agent list (6 agents)

| Agent | Description |
|-------|-------------|
| `tweet-scheduler` | Craft, schedule, and post tweets and threads on X via API v2 |
| `reddit-researcher` | Browse, search, and monitor Reddit communities and sentiment |
| `discord-moderator` | Send messages, manage roles, handle moderation tasks on Discord |
| `telegram-broadcaster` | Send messages, alerts, and scheduled broadcasts via Telegram |
| `linkedin-poster` | Post professional updates and share articles on LinkedIn |
| `viral-hunter` | Discover trending content and viral posts across Twitter, Reddit, and TikTok |

---

## Agent file structure

```
agents/<agent-name>/
  agent.md    ← full agent definition (used with /agent command)
  README.md   ← what it does, required skills, required keys
```

---

## Adding new agents

1. Create a folder under `agents/your-agent-name/`
2. Write `agent.md` with the agent definition
3. Write `README.md` documenting required skills and keys
4. Send a PR to [github.com/jelly-chain/Extension/jelly-social-agents](https://github.com/jelly-chain/Extension/jelly-social-agents)

---

## License

MIT
