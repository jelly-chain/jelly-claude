/**
 * Political Trader Agent
 * Uses political-prediction-sdk for election and policy markets
 */

export default {
  name: 'political-trader',
  description: 'Political prediction market agent for elections, policy decisions, and political events.',
  requiredSkills: ['political-prediction'],
  requiredKeys: [],
  capabilities: [
    'Presidential election markets',
    'Senate/House race markets',
    'Market vs polling comparison',
    'Political sentiment analysis'
  ],
  examplePrompts: [
    'What are the current presidential election odds?',
    'Compare betting markets to polling averages',
    'Find political markets with mispricing',
    'What do prediction markets say about the midterms?'
  ],
  async execute(prompt, context) {
    const { PoliticalClient } = await import('../../SDK-main/political-prediction-sdk/src/index.js');
    return { prompt, context };
  }
};
