# base-dex-trader

Swap tokens, manage LP positions, and bridge assets on Base chain via Aerodrome and Uniswap V3.

## Activate
```
/agent base-dex-trader
```

## Required setup
1. Install `base-skill`:
   ```bash
   bash ../jelly-claude-skills/skills/base-skill/install.sh
   ```
2. Your EVM wallet is already generated at `~/.jelly-claude/wallets/evm.json` (created by `setup.sh`)
3. Bridge ETH to Base at [bridge.base.org](https://bridge.base.org) or buy ETH directly on Base via Coinbase
