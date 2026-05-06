/**
 * jelly-alchemy — Alchemy-powered onchain intelligence for Jelly Claude.
 *
 * Public API surface: tools, services, clients, schemas, prompts, config.
 */

export { getToolDefinitions } from './tools/index.js';
export type { ToolDefinition, ToolName, ToolCall, ToolResult } from './tools/index.js';

export { WalletService } from './services/wallet-service.js';
export { TokenService } from './services/token-service.js';
export { NftService } from './services/nft-service.js';
export { TransferService } from './services/transfer-service.js';
export { PortfolioService } from './services/portfolio-service.js';
export { PriceService } from './services/price-service.js';
export { ContractService } from './services/contract-service.js';
export { TracingService } from './services/tracing-service.js';
export { WebhookService } from './services/webhook-service.js';

export { AlchemyClient } from './client/alchemy.js';
export { RpcClient } from './client/rpc.js';
export { DataApiClient } from './client/data-api.js';
export { NftClient } from './client/nft.js';
export { SimulationClient } from './client/simulation.js';
export { PricesClient } from './client/prices.js';
export { PortfolioClient } from './client/portfolio.js';
export { TransfersClient } from './client/transfers.js';
export { WebhooksClient } from './client/webhooks.js';
export { SolanaClient } from './client/solana.js';

export { CHAINS, EVM_CHAINS, SOLANA_CHAINS, getChain, isEvmChain } from './config/chains.js';
export type { ChainId, ChainDescriptor } from './config/chains.js';
export { getCapabilities, supports } from './config/capabilities.js';
export { loadEnv } from './config/env.js';
export type { AlchemyEnv } from './config/env.js';

export {
  AlchemyError,
  AlchemyRateLimitError,
  AlchemyAuthError,
  AlchemyNetworkError,
  AlchemyNotFoundError,
  AlchemyUnsupportedChainError,
  isAlchemyError,
  toAlchemyError,
} from './utils/errors.js';

export { buildWalletAnalysisPrompt } from './prompts/wallet-analysis.js';
export { buildTokenIntelPrompt } from './prompts/token-intel.js';
export { buildNftIntelPrompt } from './prompts/nft-intel.js';
export { buildContractRiskPrompt } from './prompts/contract-risk.js';
export { buildTransferSummaryPrompt } from './prompts/transfer-summary.js';

export { isWalletSummary, isWalletActivity } from './schemas/wallet.js';
export { isTokenInfo, isTokenBalance, isTokenPrice } from './schemas/token.js';
export { isNftSummary, isNftCollection } from './schemas/nft.js';
export { isTransferSummary, isTransferPage } from './schemas/transfer.js';
export { isRecord, isString, isNumber, isStringArray } from './schemas/common.js';
