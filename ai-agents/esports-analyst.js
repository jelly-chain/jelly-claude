/**
 * Esports Analyst Agent
 * Uses esports-sdk for LoL, CS2, Dota 2, Valorant predictions
 */

export default {
  name: 'esports-analyst',
  description: 'Esports prediction agent for League of Legends, CS2, Dota 2, and Valorant.',
  requiredSkills: ['esports'],
  requiredKeys: ['PANDASCORE_API_KEY'],
  capabilities: [
    'Live esports scores',
    'Team rating analysis',
    'Tournament tracking',
    'Map pool analysis',
    'Match prediction'
  ],
  examplePrompts: [
    'Who will win the T1 vs GenG match?',
    'What are the live CS2 matches right now?',
    'Predict the Valorant Champions final',
    'Which Dota 2 teams are in the top 10?'
  ],
  async execute(prompt, context) {
    const { EsportsClient, EsportPredictor } = await import('../../SDK-main/esports-sdk/src/index.js');
    return { prompt, context };
  }
};
