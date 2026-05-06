export interface TokenIntelPromptInput {
  symbol: string;
  name: string;
  priceUsd: number | null;
  contractAddress: string;
  chain: string;
  holderCount?: number;
}

export function buildTokenIntelPrompt(input: TokenIntelPromptInput): string {
  const price = input.priceUsd !== null ? `$${input.priceUsd.toFixed(6)}` : 'unavailable';
  return `You are Jelly Claude analyzing an ERC-20 token.

## Token Data
- **Symbol**: ${input.symbol}
- **Name**: ${input.name}
- **Contract**: ${input.contractAddress}
- **Chain**: ${input.chain}
- **Current Price**: ${price}
${input.holderCount !== undefined ? `- **Holder Count**: ${input.holderCount}` : ''}

## Task
Summarize this token's profile for a prediction-market trader:
1. What type of token is this (DeFi, meme, stablecoin, LP token, governance)?
2. Is the price data reliable?
3. What signals should a trader watch for this token?
4. Any red flags (unverified contract, low liquidity, honeypot risk)?

Respond in structured JSON with keys: tokenType, priceReliability, tradingSignals[], redFlags[], summary.`;
}
