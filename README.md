# Jelly

> Multi-chain AI agent for prediction markets, DeFi, and on-chain analytics

**GitHub:** [github.com/jelly-chain/jelly-claude](https://github.com/jelly-chain/jelly-claude)

---

## What is this?

Jelly is a complete AI agent ecosystem for prediction markets, DeFi, and on-chain analytics. It provides:
- Automatically selects between **Anthropic paid models** and **OpenRouter free/cheap models** based on which API key you have
- Generates your **Solana and EVM (BNB / Polygon / Ethereum) wallets** at first run
- Installs a full library of **38 skills** (Solana DeFi, BNB Chain, Ethereum, Polymarket, Kalshi, Hyperliquid, Base, predict.fun v2, Uniswap, Aave, 1inch, CoinGecko, Chainlink, DeFiLlama, OpenSea, GMX, OKX, and more)
- Loads **47 agent templates** that can be invoked with the `/agent` command
- Includes `CLAUDE.md` — session memory that pre-loads wallet paths, skill locations, and protocol reference
- Includes `torq.sh` — token-optimised launch mode using the highest-performance free models on OpenRouter
- Supports **13 Extension types** via the Extension-main directory (jelly-social, jelly-research, jelly-forex, jelly-ai, jelly-nft, jelly-defi, jelly-onchain, jelly-arbitrage, jelly-telegram, and more)


---

## Prerequisites

| Tool | Version | Get it |
|------|---------|--------|
| Node.js | v18+ | [nodejs.org](https://nodejs.org) |
| npm | v9+ | Comes with Node |
| Git | any | [git-scm.com](https://git-scm.com) |
| Solana CLI | optional | [docs.solana.com](https://docs.solana.com/cli/install-solana-cli-tools) |

---


## Contract Address 

BNB: 0xf581ee357f11d7478fafd183b4a41347c35a4444

SOL: GcUANCt1YZK9L8ap128EMrcbhNMYhHR23Ungwd7ypump

ETH: 0x871d46dc15fa55d5bb9e912e56bcedccd53acccc

BASE: 0xA7826E1d387A59d8E9710799f6cD100027421b07

---

## Quick Start

### Mac / Linux

```bash
# 1. Clone the repo (setup.sh auto-installs skills and agents)
git clone https://github.com/jelly-chain/jelly-claude
cd jelly-claude

# 2. Run the setup wizard (one time only)
bash setup.sh

# 3. Add your API key to .env
nano .env   # or: open .env in any editor

# 4. Launch the agent
bash jelly-claude.sh

# Or launch in TORQ mode (best performance per token)
bash torq.sh
```

> **Tip:** `setup.sh` automatically clones `jelly-claude-skills` and `jelly-claude-agents` from GitHub into sibling directories and installs them. You only need to clone one repo.

### Windows (PowerShell)

```powershell
# If you get an execution policy error, run first:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# 1. Clone the repo
git clone https://github.com/jelly-chain/jelly-claude
cd jelly-claude

# 2. Run setup
.\setup.ps1

# 3. Add your API key to .env, then launch
.\jelly-claude.ps1
```

---

## API Key — which one to use?

### Option A: Anthropic (recommended for full power)
Best quality, requires a paid account.

```
ANTHROPIC_API_KEY=sk-ant-...
```
Get one at [console.anthropic.com](https://console.anthropic.com)

### Option B: OpenRouter (free/low-cost)
Works with free or cheap models. Jelly auto-configures these model tiers:

| Role | Model |
|------|-------|
| Opus (complex tasks) | `deepseek/deepseek-v4-pro` |
| Sonnet (everyday tasks) | `x-ai/grok-4.3` |
| Haiku (fast tasks) | `nvidia/nemotron-3-nano-30b-a3b:exacto` |
| Sub-agent | `qwen/qwen3-next-80b-a3b-thinking` |

```
OPENROUTER_API_KEY=sk-or-...
```
Get one at [openrouter.ai/keys](https://openrouter.ai/keys)

---
## Programs 

BNB:

-
-
-
-

SOL:

-
-
-
-

ETH:

-
-
-
-

Base:

-
-
-
-

---

## What setup.sh does

1. Checks for Node.js, npm, and git
2. Installs `@anthropic-ai/claude-code` globally
3. Generates a **Solana wallet** — saved to `~/.jelly-claude/wallets/solana.json`
4. Generates an **EVM wallet** (works for BNB Chain and Polygon) — saved to `~/.jelly-claude/wallets/evm.json`
5. Optionally stores your Polymarket, Kalshi, predict.fun, and other service API keys in `~/.jelly-claude/.keys`
6. Clones and installs all 38 skills from `jelly-claude-skills` (or updates them if already present)
7. Clones and installs all 47 agent templates from `jelly-claude-agents` (or updates them if already present)

> **Security:** wallet private keys and API keys are stored only in `~/.jelly-claude/` on your local machine and are never committed to any repo.

> **No multi-clone required:** `setup.sh` handles cloning the skills and agents repos automatically. You only need to clone `jelly-claude` itself.

---

## 10 Additional Features & Adjustments

1. **Intelligent Model Selection** — Automatic switching between Anthropic and OpenRouter based on availability and cost
2. **Real-time Health Monitoring** — System metrics dashboard with alerts
3. **Enhanced Security** — Improved key management and secret handling
4. **Parallel Module Execution** — Run multiple modules simultaneously with resource awareness
5. **Advanced Caching** — Intelligent caching layer for API responses
6. **Circuit Breakers** — Protection against API failures and rate limits
7. **Memory System** — Persistent memory across sessions
8. **Telegram Integration** — Remote control via Telegram bot
9. **Voice Interface** — Voice-activated commands (experimental)
10. **Extension System** — Modular extensions for specialized tasks

---

Jelly is built from the ground up for prediction market excellence:

### Jelly Score Framework
The core signal quality metric (0–100) determines position sizing:
- 80–100: Strong signal → Full position
- 60–79: Moderate signal → Half position  
- 0–59: Weak signal → No trade

### Edge Score
Estimates probability advantage over market price. Combined with Jelly Score, it provides the strongest entry signals.

### Market Divergence Detection
When prices differ across platforms (e.g., Polymarket vs Kalshi), the system identifies arbitrage opportunities (>3% spread by default).

### Sentiment Integration
External signals (news, social, on-chain) can be injected to enhance prediction accuracy.

The agent continuously monitors prediction markets, scores signals, and executes trades based on quantified edge.

---

The setup process has been streamlined for ease of use:

1. **Clone the repository**
2. **Run `bash setup.sh`** — handles everything automatically
3. **Add your API key to `.env`**
4. **Launch with `bash jelly-claude.sh`**

The wizard automatically:
- Checks Node.js and npm
- Installs Claude Code CLI
- Generates Solana and EVM wallets
- Optionally collects API keys for prediction markets
- Clones and installs all 38 skills
- Clones and installs all 47 agent templates
- Creates necessary directories and config files

No manual configuration required — everything works out of the box.

---

When launching the agent, a beautiful "Jelly Octopus Ink" visual appears in the terminal:

- **Ink spread animation** — Simulates octopus ink dispersal
- **Color gradients** — Uses Jelly Chain brand colors
- **Performance indicator** — Shows current system load
- **Model tier display** — Indicates which AI model is active
- **Ready signal** — Confirms agent is fully initialized

The splash screen is generated by `core/ink-ui/main.mjs` and can be disabled via `JELLY_NO_SPLASH=1` environment variable.

---

Control Jelly with the special `<Jelly>` command:

- `<Jelly> <filename>` — Opens or executes files intelligently
- `<Jelly> run <module>` — Executes specific modules
- `<Jelly> agents` — Lists all available agents
- `<Jelly> skills` — Lists all installed skills
- `<Jelly> status` — Shows system status and resource usage
- `<Jelly> scan <query>` — Quick scanner queries
- `<Jelly> predict <text>` — Quick prediction signals

This provides a fast, keyboard-friendly interface for power users.

---

Jelly v2 intelligently manages agent and subagent concurrency based on system resources:

- **Adaptive scaling** — Automatically adjusts parallel workstreams
- **Resource monitoring** — Tracks CPU and memory usage in real-time
- **Smart queuing** — Prioritizes tasks based on system load
- **Efficient execution** — Maximizes throughput without overloading

The system starts with up to 5 parallel workstreams and scales up when resources allow, ensuring optimal performance on any machine.

---

Jelly now includes 12 powerful modules with comprehensive implementations:

### Market Module
- **predict** — Generate Jelly Score predictions (0-100) with confidence and risk metrics
- **batchPredict** — Predict on multiple inputs simultaneously
- **scoreMarket** — Score specific prediction markets
- **signals** — Scan DeFi protocols for trading signals
- **scanKeywords** — Trigger on keyword matches in text
- **scanThresholds** — Detect numeric threshold breaches
- **anomalies** — Monitor for market anomalies
- **detectVolume** — Identify volume spikes
- **detectTvl** — Spot TVL shocks
- **backtest** — Test prediction scenarios against historical data

### Portfolio Module
- **snapshot** — Multi-chain portfolio snapshot (Solana, BNB, Polygon, Base)
- **summary** — Formatted portfolio summary
- **pnl** — Calculate profit/loss across snapshots
- **addWallet** — Add wallets to monitoring

### Scanner Module
- **scan** — Custom chain queries
- **newTokens** — Discover new token launches
- **trending** — Find trending tokens
- **search** — Search by query
- **volumeSpike** — Detect unusual volume activity
- **rugCheck** — Audit tokens for rug-pull risk
- **topHolders** — Analyze token holder distribution
- **tokenMetadata** — Fetch token metadata

### Prediction Markets Module
- **polymarkets** — Polymarket with Jelly Score integration
- **kalshiMarkets** — Kalshi market data
- **predictFunMarkets** — predict.fun markets
- **compareMarkets** — Cross-platform price comparison
- **arbitrage** — Find arbitrage opportunities
- **monitorPrices** — Track prices across platforms
- **setAlert** — Create price alerts
- **checkAlerts** — Check active alerts

### DeFi Module
- **yields** — Find best yields across DeFi protocols
- **pools** — Filter liquidity pools
- **jupiterQuote** — Get Jupiter swap quotes
- **price** — Fetch token prices
- **liquidity** — Analyze DEX liquidity depth
- **volume** — Check chain volume statistics
- **topVolumePools** — Discover high-volume pools

### Bridge Module
- **routes** — Find cheapest bridge routes
- **fees** — Compare bridge fees
- **status** — Check transaction status
- **estimateGas** — Estimate gas costs
- **compareBridges** — Compare routes by cost, speed, steps
- **simulate** — Simulate bridge transactions

All modules feature intelligent caching, circuit breakers, and can be executed in parallel with CPU-aware dispatching.

---

### Solana DEX (Jupiter, Raydium, pump.fun, etc.)
- Your Solana wallet is generated automatically by `setup.sh`
- Fund it with **SOL** for gas fees
- Fund it with the tokens you want to trade

### BNB Chain DEX (PancakeSwap, four.meme, etc.)
- Your EVM wallet is generated by `setup.sh` (same address for BNB and Polygon)
- Fund it with **BNB** on BSC for gas and trading

---

## Prediction Markets — what you need

### Polymarket (on Polygon blockchain)

| Requirement | How |
|-------------|-----|
| Polygon wallet | Generated by `setup.sh` (same as your EVM wallet) |
| USDC on Polygon | Bridge from any chain or buy on CEX and withdraw to Polygon |
| Polymarket API key | [app.polymarket.com](https://app.polymarket.com) → Settings → API |
| Proxy wallet approval | One-time transaction — ask the `polymarket-trader` agent to set it up |

The agent stores your keys at `~/.jelly-claude/.keys` and `~/.claude/skills/polymarket-skill/.keys`.

### Kalshi (regulated US markets, fiat-only)

| Requirement | How |
|-------------|-----|
| Kalshi account | Sign up at [kalshi.com](https://kalshi.com) (must be US-eligible) |
| USD balance | Deposit via bank transfer inside the app |
| Kalshi API key | [kalshi.com](https://kalshi.com) → Account → API Access |
| No crypto wallet | Kalshi is fully off-chain and fiat-based |

### predict.fun (BNB Chain, open global access)

| Requirement | How |
|-------------|-----|
| EVM wallet | Generated by `setup.sh` (same as your BNB wallet) |
| BNB for gas | ~0.01 BNB covers approvals and typical trades |
| USDT on BNB Chain | Bridge from CEX or swap via PancakeSwap |
| predict.fun API key | Discord: [discord.gg/predictdotfun](https://discord.gg/predictdotfun) → support ticket |
| One-time approval | Run `builder.setApprovals()` once — agent handles this |

No KYC required. Test on BNB Testnet first (no API key needed on testnet).

---

## Skills

Skills teach the Claude agent how to interact with specific protocols and APIs.
They live in `~/.claude/skills/` after installation.

Install all skills at once (auto-clones the skills repo if needed):
```bash
npm run install-skills
```

Or install a single skill:
```bash
bash ../jelly-claude-skills/skills/jupiter-skill/install.sh
```

See [github.com/jelly-chain/jelly-claude-skills](https://github.com/jelly-chain/jelly-claude-skills) for the full list.

---

## Agent Templates

47 pre-built agents you can summon with `/agent` inside Claude Code.

Install all (auto-clones the agents repo if needed):
```bash
npm run install-agents
```

Then inside Claude Code:
```
/agent polymarket-trader
/agent predict-fun-trader
/agent jupiter-trader
/agent pump-launcher
/agent defi-yield-optimizer
/agent nft-flipper
/agent onchain-whale-tracker
/agent cross-exchange-arb
/agent portfolio-rebalancer
/agent market-maker
/agent news-sentiment-trader
/agent token-launch-monitor
```

See [Agent-Templates/README.md](./Agent-Templates/README.md) for all 47 agent templates.
See [Extension-main/](./Extension-main/) for all 13 extension types.


---

---

## Modules (v2)

Run any module directly from the command line — no Claude session needed.

```bash
# Predict a signal (Jelly Score 0–100)
node modules/market/run.mjs predict --text "Solana TVL surge breakout" --chain solana

# Scan new tokens on BNB Chain
node modules/scanner/run.mjs newTokens --chain bsc --maxAge 30

# Check top Polymarket markets, scored with Jelly Score
node modules/prediction-markets/run.mjs polymarkets --limit 10

# Cross-platform arbitrage detection
node modules/prediction-markets/run.mjs arbitrage --query "BTC"

# Portfolio snapshot
node modules/portfolio/run.mjs snapshot --solana <your-solana-address>

# DeFi yield search
node modules/defi/run.mjs yields --chain solana --minApy 20

# Bridge route comparison
node modules/bridge/run.mjs fees --fromChain 1 --toChain 56 --fromToken 0x... --toToken 0x... --fromAmount 1000000

# Alert status
node modules/alerts/run.mjs status

# Backtest prediction engine
node modules/market/run.mjs backtest --scenarios '[{"signal":"bullish","chain":"solana","actualReturn":1.5}]'
```

All 9 modules: `market`, `portfolio`, `scanner`, `alerts`, `analytics`, `prediction-markets`, `wallet`, `defi`, `bridge`

---

## npm Scripts

```bash
npm start              # Launch Jelly agent
npm run proxy          # Start the OpenRouter proxy only
npm run health         # Health check — verifies files, config, wallets
npm run check          # Dependency check — Node, npm, packages
npm run reset          # Clear logs and node_modules (keeps .env and wallets)
npm run reset -- --logs-only   # Clear logs only
npm run install-skills # Install / update all skills from jelly-claude-skills
npm run install-agents # Install / update all agent templates from jelly-claude-agents
```

---

## AI Agents (v2)

9 built-in agents used by the SDK pipeline and callable from Claude Code:

| Agent | Purpose |
|-------|---------|
| `predictor` | Jelly Score engine — score any signal |
| `scanner` | New token pair discovery with volume spike detection |
| `monitor` | Wallet balance monitoring with threshold alerts |
| `signal-hunter` | Automatic DeFi signal scanning across protocols |
| `risk-guard` | Hard limit + Jelly Score risk gate |
| `arbitrage` | Cross-platform prediction market price gap finder |
| `alert-dispatcher` | Dedup, severity filter, desktop notification routing |
| `backtest` | Replay historical signal→outcome data against prediction engine |
| `portfolio` | Multi-chain portfolio snapshot and P&L tracking |

---

## Core Config

| File | Purpose |
|------|---------|
| `config/strategies.json` | Jelly Score → position size mapping |
| `config/risk-profiles.json` | `conservative`, `balanced`, `aggressive` profiles |
| `config/chains.json` | RPC endpoints for all 7 chains |
| `config/thresholds.json` | Volume spike / TVL shock / price move alert thresholds |
| `config/keywords.json` | Bullish / bearish / high-priority keyword lists |
| `config/providers.json` | API base URLs for all data providers |
| `config/torq.json` | TORQ mode model selection |

---

## Jelly Score — how it works

The **Jelly Score** (0–100) is the core signal quality metric:

| Score | Meaning | Action |
|-------|---------|--------|
| 80–100 | Strong signal | Full position size |
| 60–79 | Moderate signal | Half position size |
| 0–59 | Weak signal | Do not trade |

### Edge Score
Alongside the Jelly Score, predictions now include an **Edge Score** — the estimated probability advantage over the implied market price. A high edge score (>10pp) combined with a high Jelly Score is the strongest entry signal.

### Market Divergence
When `platformPrices` is supplied (e.g. `{ polymarket: 0.62, kalshi: 0.55 }`), the predictor computes a **divergence report** — spread, min/max, and whether an arbitrage window is open (>3% spread by default).

### Sentiment Hook
You can inject any external sentiment signal (news, social, on-chain) into the predictor:
```js
import { getPredictor } from './core/prediction.mjs';
const predictor = getPredictor();
predictor.setSentimentHook(async (input) => {
  // return a float 0–1 (0 = bearish, 1 = bullish)
  return await mySentimentAPI(input.text);
});
```

---

## Telegram Interface

Control and monitor Jelly remotely from any Telegram client.

### 1. Create a bot

Open Telegram and message **@BotFather**:
```
/newbot
```
Copy the token it gives you — that's your `TELEGRAM_BOT_TOKEN`.

### 2. Find your chat ID

Message **@userinfobot** on Telegram. It replies with your numeric ID — that's your `TELEGRAM_CHAT_ID`.

### 3. Add both to `.env`

```
TELEGRAM_BOT_TOKEN=123456789:AAExampleTokenFromBotFather
TELEGRAM_CHAT_ID=987654321
```

### 4. Launch with the Telegram flag

```bash
# Mac / Linux
bash jelly-claude.sh --telegram

# Windows (PowerShell)
.\jelly-claude.ps1 --telegram

# Or directly via Node
node jelly-claude.mjs --telegram
```

### Bot commands

| Command | What it does |
|---------|-------------|
| `/status` | Show current mode, models, and uptime |
| `/stop` | Gracefully shut down Jelly |
| *(any other text)* | Forwarded to Claude Code as input |

### Security

Only messages from the configured `TELEGRAM_CHAT_ID` are accepted. Any other user messaging your bot receives an "Unauthorized" reply and is ignored.

### Reconnection

If the Telegram connection drops, the bridge automatically retries with exponential backoff (1 s → 2 s → 4 s → 8 s → 16 s, up to 5 attempts). You will receive a reconnecting notice in Telegram if this happens.

---

## Birdeye Integration

Add your Birdeye API key to `.env` for enhanced Solana token analytics:

```
BIRDEYE_API_KEY=  # Get one at https://birdeye.so/settings/api
```

Used by the `scanner` and `signal-hunter` agents for price feeds, token metadata, and whale tracking on Solana.

---

## Project donation Wallet 

BNB: 0xDd81Fe5404a1bF0c8b66EBC3205684c3eF5Ed17B


SOL: FuYxmffq2gYfLZ3WAsedqtmBtxLkA4XDcscnk9oTqV1C


---
## Related repos

| Repo | Purpose |
|------|---------|
| [jelly-chain/jelly-claude](https://github.com/jelly-chain/jelly-claude) | This repo — launcher + setup |
| [jelly-chain/jelly-claude-skills](https://github.com/jelly-chain/jelly-claude-skills) | 38 skills (Solana, BNB, ETH, Base, Hyperliquid, prediction markets, DeFi, NFTs, analytics) |
| [jelly-chain/jelly-claude-agents](https://github.com/jelly-chain/jelly-claude-agents) | 47 agent templates |
| [jelly-chain/predictdotfun](https://github.com/jelly-chain/predictdotfun) | predict.fun SKILL.md v2 — full CLOB API reference |
| [jelly-chain/market-prediction-sdk-v2](https://github.com/jelly-chain/market-prediction-sdk-v2) | WMarket Prediction SDK v2 — production prediction infrastructure |

---

## License

MIT — see [LICENSE](LICENSE)
