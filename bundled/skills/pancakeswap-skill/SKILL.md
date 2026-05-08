# PancakeSwap Skill

Teach Claude to trade on PancakeSwap — the leading DEX on BNB Chain.

## Key Concepts

- V3: concentrated liquidity (CLMM) — tick-based ranges
- V2: classic AMM pools
- Farms: CAKE staking and liquidity farming
- IFO: Initial Farm Offering launchpad

## API Endpoints

- Token info: `https://tokens.pancakeswap.finance/coingecko/tokens.json`
- V3 pools: `https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc`
- Price feed: `https://api.pancakeswap.info/api/v2/tokens/<address>`

## Jelly Integration

BNB Chain new pairs detected via:
- PancakeSwap PairCreated events (Factory v2/v3)
- four.meme launch monitoring
- BSCScan token tracker

## Common Operations

```
/pancakeswap tokens --query "new" --chain bsc
/pancakeswap price <token-address>
/pancakeswap swap --from BNB --to <token> --amount 0.1 --slippage 1
/pancakeswap pools --sortBy tvl --limit 10
```

## Setup

EVM_WALLET_PATH required for trades
BNB_RPC_URL defaults to https://bsc-dataseed.binance.org
