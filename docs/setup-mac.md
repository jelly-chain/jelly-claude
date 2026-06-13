# Mac / Linux Setup Guide

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | `brew install node` or [nodejs.org](https://nodejs.org) |
| npm | 9+ | Included with Node |
| git | any | `brew install git` |
| Claude Code | latest | See below |

## Step 1 — Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

Verify:
```bash
claude --version
```

## Step 2 — Clone the repos

Clone all three into the **same parent folder**:

```bash
git clone https://github.com/jelly-chain/jelly-claude
git clone https://github.com/jelly-chain/jelly-claude-skills
git clone https://github.com/jelly-chain/jelly-claude-agents
```

## Step 3 — Run setup

```bash
cd jelly-claude
bash setup.sh
```

This will:
- Generate your Solana and EVM wallets into `~/.jelly-claude/wallets/`
- Install all 28 skills into `~/.claude/skills/`
- Install all 28 agent templates into `~/.claude/agents/`

## Step 4 — Configure your API key

```bash
nano .env
```

Add **one** of:

```bash
# Option A — Anthropic (full power)
ANTHROPIC_API_KEY=sk-ant-...

# Option B — OpenRouter (free models)
OPENROUTER_API_KEY=sk-or-...
```

## Step 5 — Launch

```bash
# Standard mode
bash jelly-claude.sh

# TORQ mode (best performance per token)
bash torq.sh
```

## Running modules directly

```bash
# Predict a signal
node modules/market/run.mjs predict --text "Solana TVL surge" --chain solana

# Scan new tokens
node modules/scanner/run.mjs newTokens --chain solana --maxAge 30

# Check portfolio
node modules/portfolio/run.mjs snapshot --solana <your-address>

# Health check
npm run health
```

## Troubleshooting

See [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) and [docs/troubleshooting-windows.md](troubleshooting-windows.md).
