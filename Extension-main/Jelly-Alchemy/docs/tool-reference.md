# Tool Reference

All 19 Jelly-Alchemy tools are registered in `src/tools/index.ts` and available via `getToolDefinitions()`.

## EVM Wallet Tools

| Tool | Returns | Required Params | Use Case |
|------|---------|-----------------|----------|
| `get-wallet-balance` | Native balance (hex + ETH) | `address`, `chain` | Check ETH/BNB/POL balance |
| `get-token-balances` | ERC-20 token list | `address`, `chain` | All tokens in a wallet |
| `get-wallet-transfers` | Sent + received transfers | `address`, `chain` | Transfer history |
| `get-wallet-portfolio` | Full portfolio snapshot | `address`, `chain` | Native + tokens |

## Token & Price Tools

| Tool | Returns | Required Params | Use Case |
|------|---------|-----------------|----------|
| `get-token-price` | USD price | `symbols` or `address`+`network` | Live token prices |
| `resolve-token` | Name, symbol, decimals | `contractAddress`, `chain` | Token metadata lookup |

## NFT Tools

| Tool | Returns | Required Params | Use Case |
|------|---------|-----------------|----------|
| `get-nfts-by-owner` | Owned NFTs | `owner`, `chain` | Wallet NFT holdings |
| `get-nft-metadata` | NFT metadata + attributes | `contractAddress`, `tokenId`, `chain` | Single NFT detail |

## Contract & Transaction Tools

| Tool | Returns | Required Params | Use Case |
|------|---------|-----------------|----------|
| `get-contract-state` | eth_call result | `contractAddress`, `calldata`, `chain` | Read contract state |
| `get-transaction-details` | TX + receipt | `hash`, `chain` | Transaction lookup |
| `simulate-transaction` | Asset changes preview | `from`, `to`, `chain` | Pre-flight check |
| `get-gas-data` | Gas price + estimate | `chain` | Gas estimation |
| `get-block-data` | Block data | `chain` | Block info |
| `get-logs` | Event logs | `chain`, `fromBlock` | Log filtering |

## Tracing & Debug Tools

| Tool | Returns | Required Params | Use Case |
|------|---------|-----------------|----------|
| `trace-transaction` | Call trace | `hash`, `chain` | Internal call tree |
| `debug-transaction` | Receipt + trace | `hash`, `chain` | Failed TX diagnosis |

## Webhook Tools

| Tool | Returns | Required Params | Use Case |
|------|---------|-----------------|----------|
| `watch-address` | Webhook registration | `address`, `webhookUrl`, `network` | Real-time alerts |

## Solana Tools (DAS API)

| Tool | Returns | Required Params | Use Case |
|------|---------|-----------------|----------|
| `solana-get-assets-by-owner` | Asset list | `ownerAddress` | Solana NFT/token holdings |
| `solana-get-asset` | Single asset detail | `id` | NFT or cNFT metadata |
