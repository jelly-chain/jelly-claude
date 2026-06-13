# Polymarket Playbooks

Structured decision patterns for using jelly-polygon-tentacle with Polymarket markets.

## Playbook 1: Daily Market Digest

Run every morning to surface the top 10 active markets by volume, compute implied probabilities, and detect any overnight order-flow shifts.

```
1. poly-get-polymarket-markets (status: active, limit: 10)
2. For each market: poly-get-polymarket-orderflow (conditionId)
3. Compute imbalance for each order book
4. Sort by volume · Filter by signal strength "strong"
5. Build PolymarketPredictionPrompt → send to Claude
```

## Playbook 2: Resolution Tracker

Check all markets resolving in the next 24 hours and verify their on-chain resolution state.

```
1. poly-get-polymarket-resolutions (limit: 20)
2. For unresolved approaching markets: poly-get-polymarket-orderflow
3. Flag markets where order-flow diverges from expected resolution
```

## Playbook 3: Whale + Market Correlation

Correlate large Polygon transfers into the CTF Exchange with market price moves.

```
1. poly-watch-address (CTF Exchange: 0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E)
2. On activity: poly-get-token-flows (address: CTF Exchange, window: 1h)
3. poly-get-market-signals (window: 1h)
4. Cross-reference large USDC flows with active markets → flag correlated markets
```

## Playbook 4: Volatility-Gated Confidence

Only surface high-confidence predictions when volatility regime is calm or building.

```
1. poly-get-volatility-window (window: 1h)
2. If regime = explosive: reduce all confidence scores by 0.2
3. If regime = calm: use raw model confidence
4. Apply adjusted confidence to explain_prediction output
```

## CTF Exchange Addresses

| Contract | Address | Chain |
|---|---|---|
| CTF Exchange | `0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E` | Polygon 137 |
| Neg Risk CTF Exchange | `0xC5d563A36AE78145C45a50134d48A1215220f80a` | Polygon 137 |
| UMA CTF Adapter | `0xf05321ea3d24d2b16e4c76bca199da57faf68700` | Polygon 137 |
