# wallet — Multi-Chain Wallet Manager

Manages wallet information, balance checking, and wallet monitoring across Solana and EVM chains (BNB, Polygon, Ethereum, Base, Arbitrum, Hyperliquid).

## Tools

| Tool | Description |
|------|-------------|
| `balance` | Get token balance for an `--address` on a `--chain` (default: solana). Auto-detects default wallet if no address provided |
| `info` | Show wallet info for both Solana and EVM wallets (public keys only, never private keys) |
| `watch` | Add a wallet to monitoring with `--address` and `--chain`, optional `--label` |
| `unwatch` | Remove a wallet from monitoring by `--address` |
| `monitored` | List all watched wallets and their monitoring status |

## Supported Chains

- `solana` — Solana mainnet (via `api.mainnet-beta.solana.com`)
- `bnb` — BNB Smart Chain
- `polygon` — Polygon PoS
- `ethereum` — Ethereum mainnet
- `base` — Base
- `arbitrum` — Arbitrum One
- `hyperliquid` — Hyperliquid

## Wallet Files

- Solana: `~/.jelly-claude/wallets/solana.json`
- EVM: `~/.jelly-claude/wallets/evm.json`

## Usage

```bash
node modules/wallet/run.mjs balance --address <solana_address>
node modules/wallet/run.mjs balance --address <evm_address> --chain bnb
node modules/wallet/run.mjs info
node modules/wallet/run.mjs watch --address <address> --chain solana --label "My Wallet"
node modules/wallet/run.mjs unwatch --address <address>
node modules/wallet/run.mjs monitored
```

## Address Validation

- Solana: Base58 format, 32-44 characters
- EVM: Hex format, `0x` + 40 hex characters

## Notes

- Uses real RPC calls for balance fetching
- Caches balances with 30s TTL
- Uses `MonitorAgent` from `ai-agents/monitor.js` for wallet watching
- Private keys are never displayed
