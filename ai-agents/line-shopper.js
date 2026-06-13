/**
 * Line Shopper Agent
 * Uses line-movement-sdk + betfair-exchange-sdk for best odds
 */

export default {
  name: 'line-shopper',
  description: 'Finds the best odds across sportsbooks by tracking line movement and exchange prices.',
  requiredSkills: ['line-movement', 'betfair'],
  requiredKeys: ['BETFAIR_APP_KEY'],
  capabilities: [
    'Line movement tracking',
    'Steam move detection',
    'Best odds identification',
    'Sharp money analysis',
    'Value bet detection'
  ],
  examplePrompts: [
    'Where can I get the best odds for the Lakers game?',
    'Is there sharp money on this match?',
    'Has the line moved significantly?',
    'Find value bets where the model disagrees with the line'
  ],
  async execute(prompt, context) {
    return { prompt, context };
  }
};
