# Jelly-Alchemy

**Alchemy-powered onchain intelligence extension for [Jelly Claude](https://github.com/jelly-chain/jelly-claude).**

Jelly-Alchemy treats Alchemy not as a bare RPC provider, but as a full onchain data plane — giving Jelly Claude structured access to wallet balances, token portfolios, NFT holdings, transfer histories, token prices, contract reads, transaction simulation, event logs, tracing, webhooks, and Solana DAS queries, all expressed as typed Claude function-calling tools.

> **GitHub**: [Extension-main](https://github.com/jelly-chain/jelly-claude/tree/main/Extension-main) · [Jelly Claude](https://github.com/jelly-chain/jelly-claude)

---

## How It Relates to the Jelly Ecosystem

| Extension | Focus |
|-----------|-------|
| **Jelly-Alchemy** (this repo) | Broad EVM + Solana data plane — 6 chains, 19 tools |
| **Jelly-polygon-tentacle** | Polygon-deep signal engine — Polymarket, whale tracking, volatility signals |
| **world-cup-jelly-sdk** | FIFA World Cup prediction context for Jelly Claude |

Jelly-Alchemy is the **general-purpose** layer. If you need Polygon-specific prediction signals or Polymarket orderflow, pair it with [Jelly-polygon-tentacle](https://github.com/jelly-chain/jelly-claude/tree/main/Extension-main/Jelly-polygon-tentacle).

---

## Chain Coverage

| Chain | ID | Native | EVM ID | NFT | Simulation | Tracing | Webhooks |
|-------|----|--------|--------|-----|------------|---------|----------|
| Ethereum | `eth-mainnet` | ETH | 1 | ✅ | ✅ | ✅ | ✅ |
| BNB Chain | `bnb-mainnet` | BNB | 56 | ✅ | ✅ | ✅ | ✅ |
| Base | `base-mainnet` | ETH | 8453 | ✅ | ✅ | — | ✅ |
| Arbitrum One | `arb-mainnet` | ETH | 42161 | ✅ | ✅ | ✅ | ✅ |
| Polygon PoS | `polygon-mainnet` | POL | 137 | ✅ | ✅ | ✅ | ✅ |
| opBNB | `opbnb-mainnet` | BNB | 204 | — | ✅ | — | ✅ |
| Solana | `solana-mainnet` | SOL | — | ✅ | — | — | — |

---

## Directory Structure

```
Extension-main/Jelly-Alchemy/
├── src/
│   ├── index.ts                   # Public entry point — re-exports everything
│   ├── config/
│   │   ├── env.ts                 # Reads ALCHEMY_API_KEY + 7 chain URLs, no `as any`
│   │   ├── chains.ts              # Chain registry: IDs, native tokens, block explorers
│   │   └── capabilities.ts        # Per-chain feature flags (supportsNFT, supportsTrace, …)
│   ├── client/
│   │   ├── alchemy.ts             # Base AlchemyClient: endpoint construction, typed request()
│   │   ├── rpc.ts                 # JSON-RPC helpers: eth_getBalance, eth_call, eth_getLogs
│   │   ├── data-api.ts            # Alchemy Data API: token balances, asset transfers
│   │   ├── prices.ts              # alchemy_getTokenPrices by symbol and address
│   │   ├── portfolio.ts           # Native + ERC-20 portfolio snapshots
│   │   ├── transfers.ts           # High-level inbound/outbound transfer history
│   │   ├── nft.ts                 # alchemy_getNFTsForOwner, alchemy_getNFTMetadata
│   │   ├── simulation.ts          # alchemy_simulateAssetChanges
│   │   ├── webhooks.ts            # Alchemy Notify webhook types and stub client
│   │   └── solana.ts              # Solana DAS API: getAssetsByOwner, getAsset
│   ├── tools/
│   │   ├── index.ts               # ToolName union, ToolDefinition interface, getToolDefinitions()
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
│   │   ├── wallet-service.ts      # getSummary(), getBalanceAcrossChains()
│   │   ├── token-service.ts       # getBalances(), getAllBalances() with pagination
│   │   ├── nft-service.ts         # getNftsForOwner(), getAllNfts(), getNftsByCollection()
│   │   ├── transfer-service.ts    # getActivity(), getRecentTransfers()
│   │   ├── portfolio-service.ts   # getPortfolio(), getMultiChainPortfolio()
│   │   ├── price-service.ts       # getPricesBySymbol(), getPriceByAddress() with cache
│   │   ├── contract-service.ts    # readState(), getTokenInfo(), isContract()
│   │   ├── tracing-service.ts     # traceTransaction() with chain capability check
│   │   └── webhook-service.ts     # watchAddresses(), listAll(), remove()
│   ├── prompts/
│   │   ├── wallet-analysis.ts     # buildWalletAnalysisPrompt()
│   │   ├── token-intel.ts         # buildTokenIntelPrompt()
│   │   ├── nft-intel.ts           # buildNftIntelPrompt()
│   │   ├── contract-risk.ts       # buildContractRiskPrompt()
│   │   └── transfer-summary.ts    # buildTransferSummaryPrompt()
│   ├── schemas/
│   │   ├── common.ts              # isRecord(), isString(), isPaginatedResult() type guards
│   │   ├── wallet.ts              # WalletSummary, WalletActivity + type guards
│   │   ├── token.ts               # TokenInfo, TokenBalance, TokenPrice + type guards
│   │   ├── nft.ts                 # NftSummary, NftCollection + type guards
│   │   └── transfer.ts            # TransferSummary, TransferPage + type guards
│   └── utils/
│       ├── errors.ts              # AlchemyError hierarchy (no `as any`)
│       ├── format.ts              # weiToEth(), hexToDecimal(), shortAddress()
│       ├── normalize.ts           # normalizeTokenBalance(), normalizeTransfer()
│       ├── pagination.ts          # paginate() async generator, buildPagedRequest()
│       └── caching.ts             # SimpleCache with TTL
├── examples/
│   ├── wallet-overview.ts         # Native + token + transfer summary on ETH
│   ├── bnb-token-intel.ts         # Token prices + metadata on BNB Chain
│   ├── evm-portfolio.ts           # Multi-chain portfolio snapshot
│   └── solana-assets.ts           # DAS API: list + fetch Solana assets
├── test/
│   ├── tools.test.ts              # 19 tools present, correct shape
│   ├── services.test.ts           # All 9 services instantiate
│   ├── schemas.test.ts            # All type guards validated
│   └── fixtures/
│       └── wallet.ts              # Sample typed fixtures
├── docs/
│   ├── supported-chains.md        # Chain + feature matrix
│   ├── tool-reference.md          # Full tool table with params
│   ├── prompts.md                 # Prompt builder API reference
│   └── webhook-playbooks.md       # Alchemy Notify usage patterns
├── .env.example                   # All 8 env vars with comments
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── LICENSE (MIT)
```

---

## All 19 Tools

| Tool | Returns | Use Case |
|------|---------|----------|
| `get-wallet-balance` | Native balance + ETH equivalent | Check ETH/BNB/POL/SOL balance |
| `get-token-balances` | ERC-20 token list with raw balances | All tokens in a wallet |
| `get-wallet-transfers` | Sent + received transfer history | Transfer timeline |
| `get-wallet-portfolio` | Full portfolio snapshot | Native + all tokens |
| `get-token-price` | USD price by symbol or address | Live token pricing |
| `get-nfts-by-owner` | All owned NFTs | NFT holdings |
| `get-nft-metadata` | Name, description, image, attributes | Single NFT detail |
| `get-contract-state` | eth_call result | Read contract view function |
| `get-transaction-details` | TX + receipt + logs | Transaction lookup |
| `simulate-transaction` | Asset changes preview | Pre-flight before signing |
| `watch-address` | Webhook registration | Real-time address activity |
| `get-gas-data` | Gas price + estimate | Fee estimation |
| `resolve-token` | Name, symbol, decimals, logo | Token metadata lookup |
| `get-block-data` | Block number, timestamp, gas stats | Block info |
| `get-logs` | Filtered event logs | Contract event stream |
| `trace-transaction` | Internal call tree | Debug internal calls |
| `debug-transaction` | Receipt + trace together | Diagnose failed TXs |
| `solana-get-assets-by-owner` | Solana DAS asset page | Solana NFT + token holdings |
| `solana-get-asset` | Single Solana asset detail | cNFT or NFT metadata |

---

## Environment Variables

Get a free API key at **https://www.alchemy.com** — one key covers all chains.

```bash
# .env.example
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Chain RPC URLs (auto-derived from ALCHEMY_API_KEY if not set)
ALCHEMY_ETH_MAINNET_URL=https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}
ALCHEMY_BNB_MAINNET_URL=https://bnb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}
ALCHEMY_BASE_MAINNET_URL=https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}
ALCHEMY_ARB_MAINNET_URL=https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}
ALCHEMY_POLYGON_MAINNET_URL=https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}
ALCHEMY_OPBNB_MAINNET_URL=https://opbnb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}
ALCHEMY_SOLANA_MAINNET_URL=https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}
```

| Variable | Required | Notes |
|----------|----------|-------|
| `ALCHEMY_API_KEY` | Yes | Free tier at alchemy.com |
| `ALCHEMY_ETH_MAINNET_URL` | No | Auto-built from key if absent |
| `ALCHEMY_BNB_MAINNET_URL` | No | Auto-built from key if absent |
| `ALCHEMY_BASE_MAINNET_URL` | No | Auto-built from key if absent |
| `ALCHEMY_ARB_MAINNET_URL` | No | Auto-built from key if absent |
| `ALCHEMY_POLYGON_MAINNET_URL` | No | Auto-built from key if absent |
| `ALCHEMY_OPBNB_MAINNET_URL` | No | Auto-built from key if absent |
| `ALCHEMY_SOLANA_MAINNET_URL` | No | Auto-built from key if absent |

---

## Quick Start

```typescript
import { getToolDefinitions, WalletService, PriceService, isWalletSummary } from 'jelly-alchemy';

// Register tools with Claude function calling
const tools = getToolDefinitions(); // ToolDefinition[] — strictly typed

// Use services directly in your agent
const walletSvc = new WalletService();
const summary = await walletSvc.getSummary(
  '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  'eth-mainnet',
);

// Narrow with type guards — no `as any`
if (isWalletSummary(summary)) {
  console.log(`Balance: ${summary.nativeBalanceEth} ETH`);
}

// Prices
const priceSvc = new PriceService();
const prices = await priceSvc.getPricesBySymbol(['ETH', 'BNB', 'POL']);
for (const p of prices) {
  console.log(`${p.symbol}: $${p.priceUsd?.toFixed(2) ?? 'N/A'}`);
}
```

---

## Installation into Jelly Claude

1. Clone or copy `Extension-main/Jelly-Alchemy/` alongside your other extensions
2. Copy `.env.example` → `.env` and fill in `ALCHEMY_API_KEY`
3. Run `npm install` inside the folder
4. Import `getToolDefinitions()` and pass the result to your Claude tool registry:

```typescript
import { getToolDefinitions } from './Extension-main/Jelly-Alchemy/src/index.js';

const alchemyTools = getToolDefinitions();
// Add to your Claude Anthropic client tools array
```

5. In your tool dispatcher, route tool calls to the relevant handler:

```typescript
import { handleGetWalletBalance } from './Extension-main/Jelly-Alchemy/src/tools/get-wallet-balance.js';

const result = await handleGetWalletBalance({ address, chain });
```

---

## Compliance

- **Read-only by default.** The only write-capable tool is `watch-address` (registers a webhook), and `simulate-transaction` which previews changes without broadcasting.
- **Simulation ≠ execution.** `alchemy_simulateAssetChanges` shows what *would* happen; it does not sign or submit a transaction.
- **No private keys.** This extension never handles signing — it is a data and intelligence layer only.
