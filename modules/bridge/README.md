# bridge module

Cross-chain bridge routing via LI.FI — find cheapest routes, estimate fees, track transactions.

## Usage

```bash
# Find bridge routes from Ethereum to BNB Chain
node modules/bridge/run.mjs routes --fromChain 1 --toChain 56 --fromToken 0xA0b... --toToken 0x55d... --fromAmount 100000000

# Just get fee estimates
node modules/bridge/run.mjs fees --fromChain 137 --toChain 8453 --fromToken 0x2791... --toToken 0x833... --fromAmount 50000000

# Track a bridge transaction
node modules/bridge/run.mjs status --txHash 0xabc123...
```

## Chain IDs

| Chain | ID |
|-------|----|
| Ethereum | 1 |
| BNB Chain | 56 |
| Polygon | 137 |
| Base | 8453 |
| Arbitrum | 42161 |
