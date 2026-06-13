/**
 * Metaculus Calibrator Agent
 * Uses metaculus-sdk to calibrate model probabilities against superforecasters
 */

export default {
  name: 'metaculus-calibrator',
  description: 'Calibrates prediction model probabilities against Metaculus superforecaster consensus.',
  requiredSkills: ['metaculus'],
  requiredKeys: [],
  capabilities: [
    'Superforecaster predictions',
    'Calibration assessment',
    'Brier score calculation',
    'High-conviction signal detection',
    'Market vs Metaculus comparison'
  ],
  examplePrompts: [
    'What do superforecasters think about AI timeline predictions?',
    'Calibrate my model against Metaculus predictions',
    'Find high-conviction Metaculus predictions',
    'Compare Metaculus to Polymarket on this question'
  ],
  async execute(prompt, context) {
    const { MetaculusClient, MetaculusAnalyzer } = await import('../../SDK-main/metaculus-sdk/src/index.js');
    return { prompt, context };
  }
};
