# hyperliquid-trader

Open and close leveraged perpetual positions on Hyperliquid L1. Manage risk, monitor funding rates, and track PnL.

## Activate
```
/agent hyperliquid-trader
```

## Required setup
1. Install `hyperliquid-skill`:
   ```bash
   bash ../jelly-claude-skills/skills/hyperliquid-skill/install.sh
   ```
2. Add keys to `~/.jelly-claude/.keys`:
   ```
   HYPERLIQUID_WALLET_ADDRESS=0x...
   HYPERLIQUID_PRIVATE_KEY=...
   ```
3. Fund your Hyperliquid account with USDC at [app.hyperliquid.xyz](https://app.hyperliquid.xyz)
