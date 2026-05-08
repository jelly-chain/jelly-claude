# Jupiter Skill

Teach Claude to use Jupiter — the leading DEX aggregator on Solana.

## Key Concepts

- Aggregates all Solana DEX liquidity (Raydium, Orca, Meteora, etc.)
- Best-price routing across multiple AMMs
- v6 API (no API key needed for quotes)

## API Endpoints

- Quote: `https://quote-api.jup.ag/v6/quote`
- Swap: `https://quote-api.jup.ag/v6/swap`
- Price: `https://price.jup.ag/v4/price`

## Required Config

```
SOLANA_WALLET_PATH=~/.jelly-claude/wallets/solana.json
HELIUS_API_KEY=  (optional, for RPC)
```

## Common Operations

```
/jupiter quote --inputMint SOL --outputMint USDC --amount 1
/jupiter swap --inputMint SOL --outputMint <token> --amount 0.1 --slippage 1
/jupiter price --ids SOL,BONK,JUP
/jupiter tokens --search "pump"
```

## Setup

1. Fund Solana wallet with SOL (for gas)
2. Optional: Set HELIUS_API_KEY for better RPC
