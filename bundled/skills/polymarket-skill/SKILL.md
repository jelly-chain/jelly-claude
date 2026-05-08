# Polymarket Skill

Teach Claude to interact with Polymarket — the leading decentralized prediction market on Polygon.

## Key Concepts

- **CLOB**: Polymarket uses a Central Limit Order Book (CLOB)
- **Proxy wallet**: Required for API trading — one-time approval transaction
- **Collateral**: USDC on Polygon network
- **Resolution**: Markets resolve via UMA oracle

## API Endpoints

- Base URL: `https://clob.polymarket.com`
- Gamma (markets): `https://gamma-api.polymarket.com`

## Required Keys (`~/.jelly-claude/.keys`)

```
POLYMARKET_API_KEY=
POLYMARKET_SECRET=
POLYMARKET_PASSPHRASE=
POLYGON_RPC_URL=https://polygon-rpc.com
EVM_WALLET_PATH=~/.jelly-claude/wallets/evm.json
```

## Common Operations

```
/polymarket list --category crypto --limit 10
/polymarket buy --marketId <id> --side YES --amount 10
/polymarket sell --marketId <id> --side YES --amount 5
/polymarket positions
/polymarket arbitrage --query "BTC"
```

## Setup

1. Create API key at https://app.polymarket.com → Settings → API
2. Run proxy wallet approval (one-time): `builder.setApprovals()`
3. Fund EVM wallet with USDC on Polygon
