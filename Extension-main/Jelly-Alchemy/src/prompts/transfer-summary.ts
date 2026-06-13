export interface TransferSummaryPromptInput {
  address: string;
  chain: string;
  sentCount: number;
  receivedCount: number;
  largestSentAsset: string;
  largestReceivedAsset: string;
  timeWindowBlocks: number;
}

export function buildTransferSummaryPrompt(input: TransferSummaryPromptInput): string {
  return `You are Jelly Claude summarizing wallet transfer activity.

## Transfer Activity
- **Address**: ${input.address}
- **Chain**: ${input.chain}
- **Window**: Last ${input.timeWindowBlocks.toLocaleString()} blocks
- **Sent**: ${input.sentCount} transfers (largest asset: ${input.largestSentAsset})
- **Received**: ${input.receivedCount} transfers (largest asset: ${input.largestReceivedAsset})

## Task
Summarize what this wallet has been doing onchain:
1. Primary activity type (accumulation, distribution, DeFi farming, bridging, bot activity)
2. Notable asset flows
3. Behavioral pattern (consistent, erratic, one-time event)
4. Prediction-market relevance: does this activity signal anything about market direction?

Respond in JSON with keys: activityType, assetFlows[], behavioralPattern, marketSignal, summary.`;
}
