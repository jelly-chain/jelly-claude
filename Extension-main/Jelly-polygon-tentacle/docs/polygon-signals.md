# Polygon Signals

This document describes the signal types produced by jelly-polygon-tentacle and how they feed into Jelly Claude's prediction routing.

## Signal Types

| `SignalType` | Trigger | Typical Source |
|---|---|---|
| `whale-move` | Large transfer above threshold (default $100k) | ERC-20 transfer event |
| `large-transfer` | Transfer above secondary threshold | `alchemy_getAssetTransfers` |
| `liquidity-add` | LP mint event on Uniswap V3 / QuickSwap | `eth_getLogs` — Mint topic |
| `liquidity-remove` | LP burn event | `eth_getLogs` — Burn topic |
| `price-spike` | Price change > N% within window | Token price API |
| `volume-surge` | Transfer count exceeds rolling mean | Asset transfer count |
| `order-flow-imbalance` | Polymarket CLOB bid/ask depth skew | CLOB API |
| `resolution-approaching` | Market end time within 24h | Polymarket markets API |
| `address-activity` | Webhook-triggered activity on watched address | Alchemy webhook |

## Confidence Tiers

| Tier | Value range | Meaning |
|---|---|---|
| `low` | 0.0–0.39 | Weak signal — insufficient evidence |
| `medium` | 0.4–0.59 | Moderate — worth noting but not actionable alone |
| `high` | 0.6–0.79 | Strong evidence — surface to Claude for reasoning |
| `very-high` | 0.8–1.0 | Definitive on-chain confirmation |

## Volatility Regime

The `VolatilityWindowAgent` labels the current market regime:

- **calm** — low transfer volume, tight price range, no large moves
- **building** — elevated volume or 1+ whale moves detected — watch for shift
- **explosive** — very high on-chain activity, multiple whale moves, wide price range

The regime is fed into Claude's context block and informs prediction market confidence adjustments.

## Block Range Calculation

All signals are scoped to a block range computed from the requested time window:

```
fromBlock = currentBlock - (windowSeconds / 2)
toBlock   = currentBlock
```

Polygon PoS has a ~2-second block time, so 1 hour ≈ 1800 blocks.
