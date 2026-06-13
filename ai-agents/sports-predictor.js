/**
 * Sports Predictor Agent
 * Uses sportradar-sdk + weather-venue-sdk + line-movement-sdk for sports predictions
 */

export default {
  name: 'sports-predictor',
  description: 'Multi-sport prediction agent using Tier 1 data from Sportradar, weather analysis, and line movement tracking.',
  requiredSkills: ['sportradar', 'weather-venue', 'line-movement'],
  requiredKeys: ['SPORTRADAR_API_KEY', 'WEATHER_API_KEY'],
  capabilities: [
    'Live scores and match data',
    'Injury report analysis',
    'Weather impact assessment',
    'Line movement detection',
    'Confidence scoring',
    'Prediction context building'
  ],
  examplePrompts: [
    'Will Arsenal beat Chelsea this weekend?',
    'What are the injury concerns for the Lakers game?',
    'How will weather affect the NFL game in Buffalo?',
    'Build prediction context for the Champions League final',
    'Is there sharp money on the Cowboys game?'
  ],
  async execute(prompt, context) {
    const { SportradarClient, SportradarAdapter, ResponseFormatter } = await import('../../SDK-main/sportradar-sdk/src/index.js');
    const { WeatherClient } = await import('../../SDK-main/weather-venue-sdk/src/index.js');
    const { LineMovementTracker } = await import('../../SDK-main/line-movement-sdk/src/index.js');

    const sportradar = new SportradarClient({ apiKey: process.env.SPORTRADAR_API_KEY });
    const weather = new WeatherClient({ apiKey: process.env.WEATHER_API_KEY, enabled: true });
    const lineTracker = new LineMovementTracker();

    // Build prediction context
    const contextData = {
      sportradar: { enabled: sportradar.enabled },
      weather: { enabled: weather.enabled },
      timestamp: new Date().toISOString()
    };

    return { context: contextData, prompt };
  }
};
