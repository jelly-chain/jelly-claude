# jelly-onchain

> On-chain analytics, whale tracking, wallet intelligence, and smart contract research powered by Claude Code.

**GitHub:** [github.com/jelly-chain/Extension/jelly-onchain](https://github.com/jelly-chain/Extension/jelly-onchain)

---

## What is this?

jelly-onchain is a Claude Code extension that:
- Installs **5 skills** covering multi-chain on-chain data, wallet analytics, and contract research
- Loads **5 agent templates** for whale tracking, wallet analysis, smart contract auditing, mempool monitoring, and on-chain alpha discovery
- Includes `CLAUDE.md` — session memory pre-loaded with skill locations and key references
- Works with Anthropic paid models or free/cheap OpenRouter models

---

## Skills included

| Skill | What it covers |
|-------|---------------|
| `etherscan-skill` | ETH/BNB/Polygon/Base/Arbitrum on-chain data — txs, balances, logs, ABIs |
| `birdeye-skill` | Solana + multi-chain token analytics, top traders, whale wallets |
| `helius-skill` | Solana RPC, DAS API, enhanced transaction parsing, webhooks |
| `defillama-skill` | Protocol TVL flows, stablecoin minting, bridge inflows |
| `chainlink-skill` | On-chain price oracle data for fair-value calculations |

## Agents included

| Agent | What it does |
|-------|-------------|
| `onchain-whale-tracker` | Track large wallet movements and correlate with price action |
| `wallet-analyst` | Full forensic analysis of any EVM or Solana wallet |
| `contract-researcher` | Read ABI, trace events, decode transactions for any contract |
| `mempool-monitor` | Watch pending transactions for large trades and liquidations |
| `alpha-hunter` | Find on-chain signals: new liquidity, unusual volume, whale accumulation |

---

## Quick Start

```bash
git clone https://github.com/jelly-chain/Extension/jelly-onchain
git clone https://github.com/jelly-chain/Extension/jelly-onchain-skills
git clone https://github.com/jelly-chain/Extension/jelly-onchain-agents

cd jelly-onchain
bash setup.sh
bash jelly-onchain.sh
```

## Windows

```powershell
.\setup.ps1
.\jelly-onchain.ps1
```

## Keys needed

| Key | Source |
|-----|--------|
| `ETHERSCAN_API_KEY` | etherscan.io/apis |
| `BSCSCAN_API_KEY` | bscscan.com/apis |
| `BIRDEYE_API_KEY` | birdeye.so |
| `HELIUS_API_KEY` | helius.xyz |

## Example prompts

```
"Show me all transactions for wallet 0x... in the last 7 days"
"What tokens does this Solana wallet hold and what's the USD value?"
"Find wallets that bought [token] before the 10x pump"
"What's the ABI for contract 0x...? Decode the last 5 transactions"
"Show me the top 10 ETH wallets that moved funds in the last hour"
"Is there unusual on-chain activity for [protocol] right now?"
"Track this whale wallet and alert me when they make a large move"
```
