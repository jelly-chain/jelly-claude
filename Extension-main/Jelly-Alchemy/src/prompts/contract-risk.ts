export interface ContractRiskPromptInput {
  contractAddress: string;
  chain: string;
  calldata: string;
  result: string;
  simulationChanges?: Array<{ asset: string; change: string; direction: string }>;
}

export function buildContractRiskPrompt(input: ContractRiskPromptInput): string {
  const changes = input.simulationChanges
    ? input.simulationChanges.map((c) => `  - ${c.direction} ${c.change} ${c.asset}`).join('\n')
    : '  Not available';

  return `You are Jelly Claude assessing the risk of a smart contract interaction.

## Contract Interaction
- **Contract**: ${input.contractAddress}
- **Chain**: ${input.chain}
- **Calldata (first 10 bytes)**: ${input.calldata.slice(0, 22)}…
- **eth_call Result**: ${input.result.slice(0, 66)}…

## Simulated Asset Changes
${changes}

## Task
Assess the risk of this contract call:
1. What function is likely being called (based on selector)?
2. Are the simulated asset changes expected?
3. Risk level: LOW / MEDIUM / HIGH / CRITICAL
4. Recommended action

Respond in JSON with keys: likelyFunction, changesAssessment, riskLevel, recommendedAction, summary.`;
}
