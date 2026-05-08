# Birdeye Skill

Teach Claude to use Birdeye — the leading Solana token analytics and price-feed API.

## Key Concepts

- Real-time OHLCV data for all Solana tokens
- Wallet portfolio tracking
- New token discovery (sorted by creation time)
- Multi-DEX aggregated prices

## API Endpoints

- Base: `https://public-api.birdeye.so`
- Token overview: `GET /defi/token_overview?address=<mint>`
- Price: `GET /defi/price?address=<mint>`
- OHLCV: `GET /defi/ohlcv?address=<mint>&type=15m&time_from=<ts>&time_to=<ts>`
- New tokens: `GET /defi/tokenlist?sort_by=v24hUSD&sort_type=desc&offset=0&limit=50`
- Trending: `GET /defi/trending_tokens`
- Trade history: `GET /defi/txs/token?address=<mint>&tx_type=swap&limit=50`

## Required Key

```
BIRDEYE_API_KEY=<key>  # https://birdeye.so/settings/api — free tier 100 req/min
```

## Common Operations

```
/birdeye overview <mint-address>
/birdeye price <mint-address>
/birdeye ohlcv <mint-address> --interval 15m --hours 4
/birdeye trending --limit 20
/birdeye new --limit 30 --minLiquidityUsd 5000
```

## Notes

- Requires `x-chain: solana` header on all requests
- Use `x-api-key: <BIRDEYE_API_KEY>` header
