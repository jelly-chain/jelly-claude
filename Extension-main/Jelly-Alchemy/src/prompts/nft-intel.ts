export interface NftIntelPromptInput {
  contractAddress: string;
  collectionName: string;
  chain: string;
  totalSupply: string | null;
  ownedCount: number;
  sampleTokenIds: string[];
}

export function buildNftIntelPrompt(input: NftIntelPromptInput): string {
  const supply = input.totalSupply ?? 'unknown';
  return `You are Jelly Claude analyzing an NFT collection.

## Collection Data
- **Contract**: ${input.contractAddress}
- **Name**: ${input.collectionName}
- **Chain**: ${input.chain}
- **Total Supply**: ${supply}
- **Owned by Queried Wallet**: ${input.ownedCount}
- **Sample Token IDs**: ${input.sampleTokenIds.slice(0, 5).join(', ')}

## Task
Provide intelligence on this NFT collection for a prediction-market context:
1. Collection type (PFP, gaming asset, art, utility)
2. Market signal: is holding this collection relevant to any active prediction markets?
3. Concentration risk (wallet holds how much of supply?)
4. Liquidity assessment

Respond in JSON with keys: collectionType, marketRelevance, concentrationRisk, liquiditySignal, summary.`;
}
