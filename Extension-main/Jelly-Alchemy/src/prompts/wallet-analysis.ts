export interface WalletAnalysisPromptInput {
  address: string;
  chain: string;
  nativeBalanceEth: string;
  tokenCount: number;
  recentTransfers: number;
}

export function buildWalletAnalysisPrompt(input: WalletAnalysisPromptInput): string {
  return `You are Jelly Claude, an onchain intelligence agent with access to Alchemy data.

## Wallet Context
- **Address**: ${input.address}
- **Chain**: ${input.chain}
- **Native Balance**: ${input.nativeBalanceEth} (native token)
- **ERC-20 Tokens Held**: ${input.tokenCount}
- **Recent Transfers (last 1000 blocks)**: ${input.recentTransfers}

## Task
Analyze this wallet's activity and holdings. Identify:
1. Whether this looks like a retail wallet, whale, contract deployer, or bot
2. Activity level (dormant, occasional, highly active)
3. Any notable token concentrations
4. Risk flags (e.g., dust attacks, unusual inflows)

Respond in structured JSON with keys: walletType, activityLevel, notableHoldings[], riskFlags[], summary.`;
}
