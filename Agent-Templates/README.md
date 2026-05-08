# Jelly-Claude Agents

> 37 ready-to-use agent templates for the Jelly-Claude multi-chain AI agent framework.

**GitHub:** [github.com/jelly-chain/jelly-claude-agents](https://github.com/jelly-chain/jelly-claude-agents)

Each agent is a pre-configured Claude Code sub-agent you can summon with the `/agent` command. Agents come pre-loaded with the right skills, prompts, and workflows for specific crypto and prediction market tasks.

---

## Install all agents

```bash
bash install-all.sh       # Mac / Linux
.\install-all.ps1         # Windows PowerShell
```

This copies all `agent.md` files to `~/.claude/agents/`.

## Install one agent

```bash
bash install-all.sh --only polymarket-trader
```

Or manually:
```bash
cp agents/polymarket-trader/agent.md ~/.claude/agents/polymarket-trader.md
```

## Use an agent

Inside Claude Code:
```
/agent polymarket-trader
```

---

## Agent list (37 agents)

### Prediction Markets
| Agent | Description |
|-------|-------------|
| `polymarket-trader` | Browse, analyze, and trade Polymarket prediction markets on Polygon |
| `kalshi-trader` | Browse, analyze, and trade Kalshi binary contracts (US regulated) |
| `jelly-predictions-agent` | Cross-reference jellychain.fun on-chain data with Polymarket and Kalshi markets |

### Prediction Intelligence
| Agent | Description |
|-------|-------------|
| `jelly-score-optimizer` | Full JellyScore pipeline: keyword + on-chain + cross-market → YES/NO recommendation |
| `cross-market-arb-hunter` | Find price divergences across Polymarket, Kalshi, and predict.fun simultaneously |
| `sentiment-tracker` | Aggregate social signals and overlay net sentiment on current YES/NO prices |
| `event-risk-scorer` | Enumerate risk factors and produce a Jelly Risk Score (0–100) before any trade |
| `kalshi-polymarket-spreader` | Kalshi ↔ Polymarket arb with full fee model and collateral-type handling |

### Solana DeFi
| Agent | Description |
|-------|-------------|
| `pump-launcher` | Launch tokens on pump.fun with dev-buy and fee configuration |
| `four-meme-launcher` | Launch meme tokens on four.meme (BNB launchpad) |
| `raydium-lp` | Open and manage Raydium CLMM/AMM liquidity positions |
| `jupiter-trader` | Swaps, DCA strategies, and limit orders via Jupiter |
| `orca-market-maker` | Manage Orca Whirlpool concentrated liquidity positions |
| `meteora-launcher` | Launch tokens via Meteora bonding curve + AMM |
| `yield-optimizer` | Find and enter highest-yield positions via Kamino + Lulo |

### BNB / EVM
| Agent | Description |
|-------|-------------|
| `bnb-dex-trader` | BNB chain swaps on PancakeSwap with safety checks |
| `cross-chain-bridge` | Bridge tokens between Solana ↔ EVM via deBridge |
| `base-dex-trader` | Swaps on Base via Aerodrome and Uniswap V3 with LP position management |
| `hyperliquid-trader` | Open/close perpetual positions, set leverage, monitor funding rates on Hyperliquid |

### Data & Analytics
| Agent | Description |
|-------|-------------|
| `solana-data-fetcher` | Token prices, holder data, DEX stats via Helius + CoinGecko |
| `bnb-data-fetcher` | BSC token data, contracts, and market metrics via BNB Chain MCP |
| `portfolio-tracker` | Wallet balances and PnL across Solana + BNB + Polygon |
| `on-chain-analyst` | Market reports combining Pyth + CoinGecko + DeFiLlama |
| `token-security-auditor` | Honeypot checks, holder concentration, contract analysis |
| `birdeye-analyst` | Trending tokens, holder analysis, top traders, and wallet P&L via Birdeye |
| `dexscreener-scanner` | Discover new pairs, filter by liquidity/volume/age, monitor price moves |

### On-Chain Signal
| Agent | Description |
|-------|-------------|
| `whale-signal-predictor` | Watch whale wallets via Helius; fire JellyScore re-evaluation on large moves |
| `defi-tvl-predictor` | Track DeFiLlama TVL momentum as a leading indicator for ecosystem markets |
| `solana-flow-analyst` | Net accumulation vs. distribution on any SPL token using Helius enhanced transactions |

### Portfolio & Risk
| Agent | Description |
|-------|-------------|
| `multi-chain-risk-dashboard` | Aggregate all prediction + DeFi positions into one risk view with VaR and concentration flags |
| `auto-hedge-suggester` | Suggest cost-effective hedges to reduce net delta exposure below a configurable threshold |

### Infrastructure & Utility
| Agent | Description |
|-------|-------------|
| `nft-minter` | Mint Core NFTs and collections via Metaplex |
| `airdrop-hunter` | Monitor and claim airdrop eligibility across protocols |
| `wallet-watcher` | Monitor wallets and alert on large/suspicious transfers |
| `multisig-manager` | Create and manage Squads multisig wallets |
| `mev-arbitrage` | Multi-DEX arbitrage on Solana with quote aggregation |
| `prediction-market-monitor` | Watch Polymarket + Kalshi + DFlow + PNP for sharp moves |

---

## Agent file structure

```
agents/<agent-name>/
  agent.md    ← full agent definition (used with /agent command)
  README.md   ← what it does, required skills, required keys, example prompts
```

---

## Adding new agents

1. Create a folder under `agents/your-agent-name/`
2. Write `agent.md` with the agent definition
3. Write `README.md` documenting required skills and keys
4. Send a PR to [github.com/jelly-chain/jelly-claude-agents](https://github.com/jelly-chain/jelly-claude-agents)

---

## License

MIT
