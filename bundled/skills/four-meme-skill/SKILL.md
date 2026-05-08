# four.meme Skill

Teach Claude to monitor four.meme — the leading memecoin launch platform on BNB Chain (equivalent to pump.fun on Solana).

## Key Concepts

- Bonding curve: price rises with each buy, migrates to PancakeSwap at graduation
- Collateral: BNB
- Trading fee: 1% on all trades
- Graduation: automatic PancakeSwap V2 LP at ~$50K market cap
- Chain: BNB Smart Chain (BSC)

## API / Monitoring

No official public API. Jelly monitors via:
- BSC RPC event logs: `PairCreated` events on four.meme factory
- BSCScan token tracker: new BEP-20 token listings
- On-chain bonding curve state: read `currentPrice()` and `bondedPct()`

## Common Operations

```
/fourmeme trending --limit 20
/fourmeme new --maxAgeMins 30
/fourmeme token <bsc-address>
/fourmeme buy <bsc-address> --bnb 0.05 --slippage 5
/fourmeme sell <bsc-address> --pct 100
/fourmeme watchdog --notify telegram  # alert on new launches with volume spike
```

## Setup

EVM_WALLET_PATH required for trades
BNB_RPC_URL defaults to https://bsc-dataseed.binance.org
BNBCHAIN_API_KEY for BSCScan lookups (optional but recommended)
