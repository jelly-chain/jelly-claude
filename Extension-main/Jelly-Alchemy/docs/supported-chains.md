# Supported Chains

Jelly-Alchemy provides typed access to the following chains via Alchemy.

| Chain | Chain ID | Native Token | EVM Chain ID | Notes |
|-------|----------|--------------|--------------|-------|
| Ethereum | `eth-mainnet` | ETH | 1 | Full feature support |
| BNB Chain | `bnb-mainnet` | BNB | 56 | NFT, simulation, webhooks |
| Base | `base-mainnet` | ETH | 8453 | No tracing in v0.1 |
| Arbitrum One | `arb-mainnet` | ETH | 42161 | Full EVM features |
| Polygon PoS | `polygon-mainnet` | POL | 137 | + Polymarket integration |
| opBNB | `opbnb-mainnet` | BNB | 204 | Basic reads only |
| Solana | `solana-mainnet` | SOL | N/A | DAS API tools only |

## Feature Matrix

| Feature | ETH | BNB | Base | ARB | Polygon | opBNB | Solana |
|---------|-----|-----|------|-----|---------|-------|--------|
| NFT API | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Simulation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Tracing | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Webhooks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Token Prices | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Portfolio | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Polymarket | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

## RPC URL Patterns

Alchemy uses predictable URL patterns per chain:

```
https://<chain-slug>.g.alchemy.com/v2/<ALCHEMY_API_KEY>
```

| Chain | Slug |
|-------|------|
| Ethereum | `eth-mainnet` |
| BNB Chain | `bnb-mainnet` |
| Base | `base-mainnet` |
| Arbitrum | `arb-mainnet` |
| Polygon | `polygon-mainnet` |
| opBNB | `opbnb-mainnet` |
| Solana | `solana-mainnet` |
