# contracts — Smart Contract Interaction

Provides smart contract operations including calling functions, reading events, deploying contracts, and listing events. Currently returns mock responses.

## Tools

| Tool | Description |
|------|-------------|
| `call` | Call a contract function. Requires `--address` and `--function`. Optional `--args` |
| `readEvent` | Read a contract event by `--eventHash` |
| `deploy` | Deploy a contract with `--abi` and optional `--bytecode` |
| `listEvents` | List recent contract events |

## Usage

```bash
node modules/contracts/run.mjs call --address 0x... --function "balanceOf" --args '["0x..."]'
node modules/contracts/run.mjs readEvent --eventHash 0xabc123
node modules/contracts/run.mjs deploy --abi '[...]' --bytecode 0x...
node modules/contracts/run.mjs listEvents
```

## Notes

- Currently returns mock data — blockchain RPC integration not yet implemented
- Uses caching (60s TTL)
- Expected to work with EVM chains via ethers.js
