# bnb — BNB Chain DeFi Operations

Provides DeFi operations on BNB Chain (BSC), including token swaps (PancakeSwap), liquidity provision, yield farming, borrowing, and lending.

## Tools

| Tool | Description |
|------|-------------|
| `swap` | Swap tokens on PancakeSwap. Requires `--fromToken`, `--toToken`, `--amount` |
| `liquidity` | Add liquidity to a pool. Requires `--token0`, `--token1`. Optional `--pairAddress` |
| `farm` | View yield farm info for a `--pool`. Returns APY and reward token info |
| `borrow` | Borrow tokens from a lending protocol. Requires `--token`, `--amount`. Returns interest rate and collateral ratio |
| `lend` | Lend tokens for yield. Requires `--token`, `--amount`. Returns APY |

## Usage

```bash
node modules/bnb/run.mjs swap --fromToken BNB --toToken USDT --amount 1.0
node modules/bnb/run.mjs liquidity --token0 BNB --token1 USDT
node modules/bnb/run.mjs farm --pool BNB-USDT
node modules/bnb/run.mjs borrow --token BNB --amount 10
node modules/bnb/run.mjs lend --token USDT --amount 1000
```

## Notes

- Currently uses mock data (simulated responses)
- Expected to integrate with PancakeSwap and Venus Protocol APIs
- Uses caching (60s TTL)
