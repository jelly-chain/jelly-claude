# Kalshi Skill

Teach Claude to trade on Kalshi — the regulated US prediction market (CFTC-approved).

## Key Concepts

- Fully off-chain and fiat-based (USD)
- CFTC-regulated exchange
- No crypto wallet required
- REST API v2

## API Endpoints

- Base URL: `https://trading-api.kalshi.com/trade-api/v2`

## Required Keys (`~/.jelly-claude/.keys`)

```
KALSHI_API_KEY=
KALSHI_API_SECRET=
KALSHI_BASE_URL=https://trading-api.kalshi.com/trade-api/v2
```

## Common Operations

```
/kalshi markets --query "crypto" --limit 20
/kalshi buy --ticker BTCUP-23DEC --side yes --count 10
/kalshi sell --ticker BTCUP-23DEC --side yes --count 5
/kalshi portfolio
/kalshi balance
```

## Setup

1. Create account at https://kalshi.com (must be US-eligible)
2. Deposit USD via bank transfer
3. Get API key: Account → API Access
