# pump.fun Skill

Teach Claude to interact with pump.fun — the most popular Solana memecoin launch platform.

## Key Concepts

- Bonding curve: price rises as tokens are purchased; migrates to Raydium at ~$69K market cap
- No pre-sale, no team allocation — all tokens start equal
- Trading fee: 1% on all buys/sells
- Migration: automatic Raydium LP at graduation threshold

## API Endpoints

- Base: `https://frontend-api.pump.fun`
- Coins: `GET /coins?limit=50&offset=0&sort=created_timestamp&order=DESC`
- Coin by CA: `GET /coins/:mint`
- Trades: `GET /trades/all/:mint?limit=200`
- Trending: `GET /coins?sort=last_trade_timestamp&order=DESC&limit=50`

## Jelly Integration

pump.fun tokens scored via Jelly Scanner:
- Volume spike detection (>3× 15min average)
- Whale entry alerts (>$5K single buy)
- Bonding curve progress tracking
- Migration proximity alerts (>80% bonded)

## Common Operations

```
/pumpfun trending --limit 20
/pumpfun new --maxAgeMin 10
/pumpfun token <mint-address>
/pumpfun buy <mint-address> --sol 0.1 --slippage 5
/pumpfun sell <mint-address> --pct 100
```

## Setup

SOLANA_WALLET_PATH must be set in ~/.jelly-claude/.keys
