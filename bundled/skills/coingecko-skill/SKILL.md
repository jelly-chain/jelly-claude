# CoinGecko Skill

Teach Claude to use CoinGecko — the largest free crypto market data API.

## Key Concepts

- Free tier: 30 calls/minute (no API key needed for basic endpoints)
- Pro tier: higher limits + exclusive endpoints
- Covers 13,000+ coins across 800+ exchanges

## API Endpoints

- Base: `https://api.coingecko.com/api/v3`
- Price: `GET /simple/price?ids=bitcoin,ethereum&vs_currencies=usd`
- Coin data: `GET /coins/<id>?localization=false&tickers=false&community_data=false`
- Market chart: `GET /coins/<id>/market_chart?vs_currency=usd&days=7&interval=daily`
- Trending: `GET /search/trending`
- Categories: `GET /coins/categories`
- Token by CA: `GET /coins/<chain>/contract/<address>`

## Common Operations

```
/coingecko price bitcoin,ethereum,solana
/coingecko trending
/coingecko coin solana --days 7
/coingecko token <contract-address> --chain solana
/coingecko categories --sortBy market_cap_change_24h
```

## Notes

- Use coin IDs, not symbols (e.g., "bitcoin" not "BTC")
- Rate limiting: use exponential backoff on 429 errors
- For Solana tokens: chain = "solana", pass SPL mint address
