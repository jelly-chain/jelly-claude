# Alchemy Skill

Teach Claude to use Alchemy — the industry-leading Web3 developer platform.

## Supported Chains

ETH, Polygon, Base, Arbitrum, Optimism, Solana, Astar, zkSync, Scroll, zkEVM

## Key Services

- Enhanced APIs: NFT, Token, Transaction, Trace
- Transfers API: `alchemy_getAssetTransfers` — full transfer history
- Subscription: WebSocket real-time events
- Notify: webhooks for address activity, mined transactions
- Gas Manager: sponsored transactions

## API Endpoints

- Base: `https://<network>.g.alchemy.com/v2/<ALCHEMY_API_KEY>`
- Networks: eth-mainnet, polygon-mainnet, base-mainnet, arb-mainnet, solana-mainnet

## Required Keys

```
ALCHEMY_API_KEY=<key>   # https://alchemy.com — free tier: 300M compute units/month
```

## Common Operations

```
/alchemy balance <address> --chain eth
/alchemy transfers <address> --chain polygon --asset USDC
/alchemy nfts <address> --chain base
/alchemy token <contract-address> --chain eth
/alchemy gas --chain eth
/alchemy simulate --to <contract> --data <calldata> --chain base
```

## Setup

Set the relevant RPC URLs in .env:
ALCHEMY_ETH_RPC=https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}
