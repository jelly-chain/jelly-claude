# Prompt Builders

Jelly-Alchemy ships five typed prompt builder functions in `src/prompts/`. Each takes a typed input object and returns a structured system-prompt string ready for Claude.

## `buildWalletAnalysisPrompt`

**File**: `src/prompts/wallet-analysis.ts`

Generates a prompt for analyzing a wallet's holdings and activity type.

```typescript
import { buildWalletAnalysisPrompt } from 'jelly-alchemy/prompts/wallet-analysis.js';

const prompt = buildWalletAnalysisPrompt({
  address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  chain: 'eth-mainnet',
  nativeBalanceEth: '1234.56',
  tokenCount: 42,
  recentTransfers: 17,
});
```

**Claude response shape**: `{ walletType, activityLevel, notableHoldings[], riskFlags[], summary }`

---

## `buildTokenIntelPrompt`

**File**: `src/prompts/token-intel.ts`

Generates a prompt for classifying a token and surfacing trading signals.

**Claude response shape**: `{ tokenType, priceReliability, tradingSignals[], redFlags[], summary }`

---

## `buildNftIntelPrompt`

**File**: `src/prompts/nft-intel.ts`

Generates a prompt for NFT collection intelligence in a prediction-market context.

**Claude response shape**: `{ collectionType, marketRelevance, concentrationRisk, liquiditySignal, summary }`

---

## `buildContractRiskPrompt`

**File**: `src/prompts/contract-risk.ts`

Generates a prompt for risk-assessing a smart contract interaction, optionally including simulation results.

**Claude response shape**: `{ likelyFunction, changesAssessment, riskLevel, recommendedAction, summary }`

---

## `buildTransferSummaryPrompt`

**File**: `src/prompts/transfer-summary.ts`

Generates a prompt for summarizing a wallet's transfer behavior and market signal.

**Claude response shape**: `{ activityType, assetFlows[], behavioralPattern, marketSignal, summary }`
