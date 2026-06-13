/**
 * Arbitrage Scanner Pro Agent
 * Uses polymarket-clob-sdk + kalshi-v3-sdk + betfair-exchange-sdk for cross-platform arbitrage
 */

export default {
  name: 'arb-scanner-pro',
  description: 'Advanced arbitrage detection across Polymarket, Kalshi, Betfair, and Metaculus.',
  requiredSkills: ['polymarket-clob', 'kalshi-v3', 'betfair'],
  requiredKeys: ['POLYMARKET_API_KEY', 'KALSHI_API_KEY', 'BETFAIR_APP_KEY'],
  capabilities: [
    'Cross-platform price comparison',
    'Orderbook depth analysis',
    'Arbitrage opportunity detection',
    'Fee-adjusted profit calculation',
    'Multi-leg arbitrage'
  ],
  examplePrompts: [
    'Find arbitrage between Polymarket and Kalshi',
    'Is there a spread on the presidential election market?',
    'Compare prices across all prediction platforms',
    'Find the best arbitrage opportunities right now'
  ],
  async execute(prompt, context) {
    return { prompt, context };
  }
};
