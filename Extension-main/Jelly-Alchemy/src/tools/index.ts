/** Central registry of all 19 Jelly-Alchemy tools. */

export type ToolName =
  | 'get-wallet-balance'
  | 'get-token-balances'
  | 'get-wallet-transfers'
  | 'get-wallet-portfolio'
  | 'get-token-price'
  | 'get-nfts-by-owner'
  | 'get-nft-metadata'
  | 'get-contract-state'
  | 'get-transaction-details'
  | 'simulate-transaction'
  | 'watch-address'
  | 'get-gas-data'
  | 'resolve-token'
  | 'get-block-data'
  | 'get-logs'
  | 'trace-transaction'
  | 'debug-transaction'
  | 'solana-get-assets-by-owner'
  | 'solana-get-asset';

export interface ToolInputSchema {
  type: 'object';
  properties: Record<string, { type: string; description?: string; enum?: string[] }>;
  required?: string[];
}

export interface ToolDefinition {
  name: ToolName;
  description: string;
  input_schema: ToolInputSchema;
}

export interface ToolCall {
  name: ToolName;
  parameters: Record<string, unknown>;
}

export interface ToolResult {
  tool: ToolName;
  success: boolean;
  data: unknown;
  error?: string;
}

export { getWalletBalanceTool } from './get-wallet-balance.js';
export { getTokenBalancesTool } from './get-token-balances.js';
export { getWalletTransfersTool } from './get-wallet-transfers.js';
export { getWalletPortfolioTool } from './get-wallet-portfolio.js';
export { getTokenPriceTool } from './get-token-price.js';
export { getNftsByOwnerTool } from './get-nfts-by-owner.js';
export { getNftMetadataTool } from './get-nft-metadata.js';
export { getContractStateTool } from './get-contract-state.js';
export { getTransactionDetailsTool } from './get-transaction-details.js';
export { simulateTransactionTool } from './simulate-transaction.js';
export { watchAddressTool } from './watch-address.js';
export { getGasDataTool } from './get-gas-data.js';
export { resolveTokenTool } from './resolve-token.js';
export { getBlockDataTool } from './get-block-data.js';
export { getLogsTool } from './get-logs.js';
export { traceTransactionTool } from './trace-transaction.js';
export { debugTransactionTool } from './debug-transaction.js';
export { solanaGetAssetsByOwnerTool } from './solana-get-assets-by-owner.js';
export { solanaGetAssetTool } from './solana-get-asset.js';

import { getWalletBalanceTool } from './get-wallet-balance.js';
import { getTokenBalancesTool } from './get-token-balances.js';
import { getWalletTransfersTool } from './get-wallet-transfers.js';
import { getWalletPortfolioTool } from './get-wallet-portfolio.js';
import { getTokenPriceTool } from './get-token-price.js';
import { getNftsByOwnerTool } from './get-nfts-by-owner.js';
import { getNftMetadataTool } from './get-nft-metadata.js';
import { getContractStateTool } from './get-contract-state.js';
import { getTransactionDetailsTool } from './get-transaction-details.js';
import { simulateTransactionTool } from './simulate-transaction.js';
import { watchAddressTool } from './watch-address.js';
import { getGasDataTool } from './get-gas-data.js';
import { resolveTokenTool } from './resolve-token.js';
import { getBlockDataTool } from './get-block-data.js';
import { getLogsTool } from './get-logs.js';
import { traceTransactionTool } from './trace-transaction.js';
import { debugTransactionTool } from './debug-transaction.js';
import { solanaGetAssetsByOwnerTool } from './solana-get-assets-by-owner.js';
import { solanaGetAssetTool } from './solana-get-asset.js';

export function getToolDefinitions(): ToolDefinition[] {
  return [
    getWalletBalanceTool,
    getTokenBalancesTool,
    getWalletTransfersTool,
    getWalletPortfolioTool,
    getTokenPriceTool,
    getNftsByOwnerTool,
    getNftMetadataTool,
    getContractStateTool,
    getTransactionDetailsTool,
    simulateTransactionTool,
    watchAddressTool,
    getGasDataTool,
    resolveTokenTool,
    getBlockDataTool,
    getLogsTool,
    traceTransactionTool,
    debugTransactionTool,
    solanaGetAssetsByOwnerTool,
    solanaGetAssetTool,
  ];
}
