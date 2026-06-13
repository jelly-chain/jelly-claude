# Raydium Skill

Teach Claude to interact with Raydium — the primary Solana AMM and concentrated liquidity DEX.

## Key Concepts

- AMM (CPMM): constant-product market maker — standard pool type
- CLMM: concentrated liquidity — tick-based ranges for capital efficiency
- Farm/staking: RAY rewards for LPs
- OpenBook integration: limit orders via Serum/OpenBook

## API Endpoints

- Pools: `https://api.raydium.io/v2/ammV3/ammPools`
- Pairs: `https://api.raydium.io/v2/main/pairs`
- Token price: `https://api.raydium.io/v2/main/price`
- Farms: `https://api.raydium.io/v2/main/farm/info`

## Common Operations

```
/raydium pools --sortBy volume24h --limit 20
/raydium pool <poolId>
/raydium swap --from SOL --to USDC --amount 1 --slippage 0.5
/raydium addLiquidity --poolId <id> --amountA 1 --amountB 100
/raydium removeLiquidity --poolId <id> --pct 50
```

## Setup

HELIUS_API_KEY (optional) recommended for reliable RPC
SOLANA_WALLET_PATH required for swaps
