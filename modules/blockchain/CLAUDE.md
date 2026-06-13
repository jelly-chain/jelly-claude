# blockchain — Blockchain Data Reader

Provides basic blockchain data retrieval for blocks, transactions, balances, and transaction history. Supports Solana and EVM chains.

## Tools

| Tool | Description |
|------|-------------|
| `getBlock` | Get block by `--height` or `--hash`. Optional `--chain` (default: ethereum) |
| `getTransaction` | Get transaction details by `--hash`. Optional `--chain` (default: ethereum) |
| `getBalance` | Get balance for an `--address` on a `--chain` (default: ethereum) |
| `getBlockHeight` | Get current block height for a `--chain` (default: ethereum) |
| `getTransactions` | Get transactions for an `--address` on a `--chain` (default: ethereum) |

## Usage

```bash
node modules/blockchain/run.mjs getBlock --height 123456 --chain solana
node modules/blockchain/run.mjs getTransaction --hash 0xabc123
node modules/blockchain/run.mjs getBalance --address 0x... --chain bnb
node modules/blockchain/run.mjs getBlockHeight --chain solana
node modules/blockchain/run.mjs getTransactions --address 0x... --chain polygon
```

## Notes

- Currently returns mock data (placeholder implementation)
- Supports both Solana and EVM chains
- Uses caching (60s TTL) and circuit breaker pattern
- Solana RPC: `https://api.mainnet-beta.solana.com`
