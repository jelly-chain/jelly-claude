# Jelly-Claude Agents

> 47 ready-to-use agent templates for the Jelly-Claude multi-chain AI agent framework.

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
bash install-all.sh --only predict-fun-trader
```

Or manually:
```bash
cp agents/predict-fun-trader/agent.md ~/.claude/agents/predict-fun-trader.md
```

## Use an agent

Inside Claude Code:
```
/agent predict-fun-trader
```

---

## Agent list (47 agents)

### Prediction Markets
| Agent | Description |
|-------|-------------|
| `polymarket-trader` | Browse, analyze, and trade Polymarket prediction markets on Polygon |
| `kalshi-trader` | Browse, analyze, and trade Kalshi binary contracts (US regulated) |
| `predict-fun-trader` | Full predict.fun CLOB trading on BNB Chain — orderbook, orders, positions, OAuth |
| `jelly-predictions-agent` | Cross-reference jellychain.fun on-chain data with Polymarket and Kalshi markets |
| `prediction-market-monitor` | Continuous position monitoring and price alerts across all three platforms |

### Prediction Intelligence
| Agent | Description |
|-------|-------------|
| `jelly-score-optimizer` | Full JellyScore pipeline: keyword + on-chain + cross-market → YES/NO recommendation |
| `cross-market-arb-hunter` | Find price divergences across Polymarket, Kalshi, and predict.fun simultaneously |
| `sentiment-tracker` | Aggregate social signals and overlay net sentiment on current YES/NO prices |
| `event-risk-scorer` | Enumerate risk factors and produce a Jelly Risk Score (0–100) before any trade |
| `kalshi-polymarket-spreader` | Kalshi ↔ Polymarket arb with full fee model and collateral-type handling |
| `orderbook-analyst` | Deep orderbook microstructure analysis — depth, spread, imbalance, fair value |
| `news-sentiment-trader` | Map breaking news to live prediction markets and find news-driven mispricings |
| `market-maker` | Two-sided LIMIT order market making on predict.fun CLOB to earn the spread |

### Solana DeFi
| Agent | Description |
|-------|-------------|
| `jupiter-trader` | Jupiter Ultra swaps, DCA, and limit orders on Solana |
| `meteora-launcher` | Meteora DLMM pool creation and liquidity management |
| `orca-market-maker` | Orca Whirlpool concentrated liquidity market making |
| `raydium-lp` | Raydium CLMM and CPMM LP management |
| `airdrop-hunter` | Solana airdrop eligibility checker and farming strategy |
| `pump-launcher` | Launch a token on pump.fun with bonding curve and marketing setup |
| `four-meme-launcher` | Token launch on Four.meme (BNB Chain meme launchpad) |
| `solana-data-fetcher` | Pull Solana on-chain data, SPL balances, token metadata |
| `solana-flow-analyst` | Analyze Solana transaction flows and wallet activity |

### Token Discovery
| Agent | Description |
|-------|-------------|
| `token-launch-monitor` | Monitor new launches on pump.fun and DexScreener — Jelly Launch Score, red flags |
| `dexscreener-scanner` | New pair discovery and volume surge detection via DexScreener |
| `whale-signal-predictor` | Predict market moves based on whale wallet activity patterns |

### DeFi & Yield
| Agent | Description |
|-------|-------------|
| `defi-yield-optimizer` | Best risk-adjusted yield for any token across Aave, Morpho, Compound, Uniswap V3 |
| `yield-optimizer` | General yield optimization across Solana DeFi protocols |
| `defi-tvl-predictor` | Predict TVL movements from on-chain signals and market conditions |
| `auto-hedge-suggester` | Automatically suggest hedges for open positions based on correlation analysis |
| `mev-arbitrage` | MEV and DEX arbitrage detection and execution |

### NFT
| Agent | Description |
|-------|-------------|
| `nft-minter` | Mint NFTs using Metaplex on Solana |
| `nft-flipper` | Monitor floor, find underpriced NFTs, execute buys and lists for profit |

### Multi-Chain Trading
| Agent | Description |
|-------|-------------|
| `bnb-dex-trader` | DEX trading on BNB Chain (PancakeSwap, Venus) |
| `bnb-data-fetcher` | BNB Chain on-chain data, balances, and contract reads |
| `base-dex-trader` | DEX trading on Base (Aerodrome, Uniswap V3) |
| `hyperliquid-trader` | Hyperliquid perpetuals — open/close positions, leverage, stop-loss |
| `cross-chain-bridge` | Cross-chain bridge operations and monitoring |
| `cross-exchange-arb` | Price gap detection and arb across OKX, Hyperliquid, Binance, and DEXes |
| `portfolio-rebalancer` | Aggregate multi-chain portfolio and rebalance to target allocations |

### Analytics & Intelligence
| Agent | Description |
|-------|-------------|
| `birdeye-analyst` | Token analytics via Birdeye — price history, holder distribution, whale activity |
| `onchain-whale-tracker` | Track large wallet movements and smart money across EVM and Solana |
| `token-security-auditor` | Automated token contract security analysis before trading |

### Risk & Portfolio
| Agent | Description |
|-------|-------------|
| `wallet-watcher` | Monitor wallet balances and alert on significant changes |
| `multi-chain-risk-dashboard` | Real-time risk dashboard across all open positions |
| `portfolio-tracker` | Unified P&L tracker across all chains and platforms |
| `multisig-manager` | Multi-signature wallet operations and proposal management |
| `on-chain-analyst` | Deep on-chain analysis: flow tracing, wallet clustering, anomaly detection |

---

## Agent structure

Each agent lives in `agents/<agent-name>/`:
```
agents/<agent-name>/
  agent.md    ← the agent definition Claude Code reads
  README.md   ← usage docs and example prompts (optional)
```

The `agent.md` contains:
- Role description
- Required skills
- Required API keys
- Capabilities list
- Behavior guidelines
- Workflow steps
- Output format
- Example prompts

---

## License

MIT
