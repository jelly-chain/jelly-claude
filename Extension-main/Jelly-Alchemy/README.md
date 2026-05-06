# jelly-alchemy

Alchemy‑powered onchain intelligence for Jelly Claude.

`jelly-alchemy` is the blockchain data extension for Jelly Claude, designed to give the agent reliable access to indexed wallet data, token activity, NFT data, transfers, prices, simulation workflows, webhooks, and low‑level RPC across BNB Chain and the broader EVM stack, with Solana coverage included in the extension surface as a native chain track.

## Purpose

This extension gives Jelly Claude a clean, reusable interface for reading blockchain state, tracing wallet activity, enriching transfers, resolving token and NFT context, and powering agent tools that need both raw RPC and higher‑level indexed data from Alchemy.

Instead of treating Alchemy as only an RPC provider, `jelly-alchemy` treats it as a full data plane for agent workflows:
- Chain reads and transaction submission  
- Event monitoring and enriched historical lookups  
- Portfolio views, webhook triggers, and simulation‑aware execution support  

## Folder layout

```text
extensions/
└── jelly-alchemy/
    ├── README.md
    ├── package.json
    ├── src/
    │   ├── index.ts
    │   ├── config/
    │   │   ├── env.ts
    │   │   ├── chains.ts
    │   │   └── capabilities.ts
    │   ├── client/
    │   │   ├── alchemy.ts
    │   │   ├── rpc.ts
    │   │   ├── data-api.ts
    │   │   ├── webhooks.ts
    │   │   ├── prices.ts
    │   │   ├── portfolio.ts
    │   │   ├── transfers.ts
    │   │   ├── nft.ts
    │   │   ├── simulation.ts
    │   │   └── solana.ts
    │   ├── tools/
    │   │   ├── get-wallet-balance.ts
    │   │   ├── get-token-balances.ts
    │   │   ├── get-wallet-transfers.ts
    │   │   ├── get-wallet-portfolio.ts
    │   │   ├── get-token-price.ts
    │   │   ├── get-nfts-by-owner.ts
    │   │   ├── get-nft-metadata.ts
    │   │   ├── get-contract-state.ts
    │   │   ├── get-transaction-details.ts
    │   │   ├── simulate-transaction.ts
    │   │   ├── watch-address.ts
    │   │   ├── get-gas-data.ts
    │   │   ├── resolve-token.ts
    │   │   ├── get-block-data.ts
    │   │   ├── get-logs.ts
    │   │   ├── trace-transaction.ts
    │   │   ├── debug-transaction.ts
    │   │   ├── solana-get-assets-by-owner.ts
    │   │   └── solana-get-asset.ts
    │   ├── services/
    │   │   ├── wallet-service.ts
    │   │   ├── token-service.ts
    │   │   ├── nft-service.ts
    │   │   ├── transfer-service.ts
    │   │   ├── portfolio-service.ts
    │   │   ├── price-service.ts
    │   │   ├── contract-service.ts
    │   │   ├── tracing-service.ts
    │   │   └── webhook-service.ts
    │   ├── prompts/
    │   │   ├── wallet-analysis.ts
    │   │   ├── token-intel.ts
    │   │   ├── nft-intel.ts
    │   │   ├── contract-risk.ts
    │   │   └── transfer-summary.ts
    │   ├── schemas/
    │   │   ├── wallet.ts
    │   │   ├── token.ts
    │   │   ├── nft.ts
    │   │   ├── transfer.ts
    │   │   └── common.ts
    │   └── utils/
    │       ├── format.ts
    │       ├── normalize.ts
    │       ├── pagination.ts
    │       ├── caching.ts
    │       └── errors.ts
    ├── examples/
    │   ├── wallet-overview.ts
    │   ├── bnb-token-intel.ts
    │   ├── evm-portfolio.ts
    │   └── solana-assets.ts
    ├── test/
    │   ├── tools.test.ts
    │   ├── services.test.ts
    │   └── fixtures/
    └── docs/
        ├── supported-chains.md
        ├── tool-reference.md
        ├── prompts.md
        └── webhook-playbooks.md
