/**
 * Weather Hedge Agent
 * Uses weather-venue-sdk to adjust outdoor sports predictions
 */

export default {
  name: 'weather-hedge',
  description: 'Analyzes weather impact on outdoor sports and suggests hedging adjustments.',
  requiredSkills: ['weather-venue'],
  requiredKeys: ['WEATHER_API_KEY'],
  capabilities: [
    'Venue weather forecasting',
    'Impact severity assessment',
    'Playing style adjustment',
    'Set piece impact analysis',
    'Fatigue risk scoring'
  ],
  examplePrompts: [
    'How will rain affect the NFL game in London?',
    'What\'s the weather impact on today\'s baseball games?',
    'Should I adjust my prediction for the F1 race due to weather?',
    'Which outdoor matches today have weather concerns?'
  ],
  async execute(prompt, context) {
    return { prompt, context };
  }
};
