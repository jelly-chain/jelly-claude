# wallet module

Solana and EVM wallet operations — balance checks, wallet info, and monitoring.

## Usage

```bash
node modules/wallet/run.mjs balance
node modules/wallet/run.mjs balance --address <solana-addr>
node modules/wallet/run.mjs balance --address <evm-addr> --chain bnb
node modules/wallet/run.mjs info
node modules/wallet/run.mjs watch --address <addr> --chain solana --label "Whale"
node modules/wallet/run.mjs unwatch --address <addr>
node modules/wallet/run.mjs monitored
```
