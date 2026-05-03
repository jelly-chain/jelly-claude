# portfolio module

Multi-chain portfolio tracking across Solana, BNB Chain, Polygon, and Base.

## Usage

```bash
node modules/portfolio/run.mjs snapshot --solana <addr> --evm <addr>
node modules/portfolio/run.mjs summary
node modules/portfolio/run.mjs pnl
node modules/portfolio/run.mjs addWallet --address <addr> --chain bnb --label "Trading"
```

## Tools

| Tool | Description |
|------|-------------|
| `snapshot` | Fetch current balances across all provided wallets |
| `summary` | Print a formatted summary of the last snapshot |
| `pnl` | Calculate P&L across all snapshots in session |
| `addWallet` | Add a wallet to the watch list |
