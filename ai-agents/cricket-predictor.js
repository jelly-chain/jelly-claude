/**
 * Cricket Predictor Agent
 * Uses cricket-sdk for IPL, ICC, Big Bash predictions
 */

export default {
  name: 'cricket-predictor',
  description: 'Cricket prediction agent for IPL, ICC events, and Big Bash.',
  requiredSkills: ['cricket'],
  requiredKeys: ['CRICAPI_KEY'],
  capabilities: [
    'Live cricket scores',
    'Match predictions (T20, ODI, Test)',
    'Toss impact analysis',
    'Pitch condition assessment',
    'Net Run Rate calculation'
  ],
  examplePrompts: [
    'Who will win the MI vs CSK match?',
    'What are the live IPL scores?',
    'Predict the T20 World Cup final',
    'How does the pitch affect today\'s match?'
  ],
  async execute(prompt, context) {
    const { CricketClient, CricketPredictor } = await import('../../SDK-main/cricket-sdk/src/index.js');
    return { prompt, context };
  }
};
