# Helius Skill

Teach Claude to use Helius — the most powerful Solana RPC and DAS API provider.

## Key Services

- Enhanced RPC: standard Solana RPC with higher rate limits
- DAS API: Digital Asset Standard — NFTs, tokens, inscriptions
- Webhooks: real-time address activity, token mints, program events
- Parsed transactions: human-readable transaction history
- Priority fee API: optimal fee estimation

## API Endpoints

- RPC: `https://mainnet.helius-rpc.com/?api-key=<HELIUS_API_KEY>`
- DAS: same endpoint, use `getAsset`, `getAssetsByOwner`, etc.
- Enhanced TX: `GET https://api.helius.xyz/v0/addresses/<address>/transactions?api-key=<key>`
- Token holders: `POST /v0/token-accounts?api-key=<key>`

## Required Key

```
HELIUS_API_KEY=<key>   # https://helius.xyz — free tier: 10 req/s, 1M credits/month
```

## Common Operations

```
/helius balance <address>
/helius transactions <address> --type SWAP --limit 50
/helius nfts <address>
/helius holders <mint-address>
/helius webhooks list
/helius webhooks create --address <addr> --type ENHANCED_TRANSACTION
```

## Integration

Used by jelly-scanner for whale activity detection on Solana
