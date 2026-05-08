# predict.fun Skill

Teach Claude to trade on predict.fun — the BNB Chain prediction market using USDT.

## Key Concepts

- On-chain prediction market on BNB Smart Chain
- Collateral: USDT (BEP-20)
- Markets: crypto prices, sports, current events
- Resolution: time-based or oracle-based

## API Endpoints

- Base: `https://api.predict.fun`
- Markets: `GET /v1/markets?status=open&limit=50`
- Market: `GET /v1/markets/:id`
- Orders: `GET /v1/orders?marketId=<id>`

## Required Keys

```
PREDICT_API_KEY=<key>        # via Discord support ticket
PREDICT_BASE_URL=https://api.predict.fun
EVM_WALLET_PATH=~/.jelly-claude/wallets/evm.json
BNB_RPC_URL=https://bsc-dataseed.binance.org
```

## Common Operations

```
/predictfun markets --category crypto --status open
/predictfun market <id>
/predictfun buy --marketId <id> --side YES --amount 10
/predictfun sell --marketId <id> --side YES --amount 5
/predictfun portfolio
```

## Setup

1. Fund EVM wallet with USDT on BNB Chain
2. Get API key from https://discord.gg/predictdotfun → open support ticket
