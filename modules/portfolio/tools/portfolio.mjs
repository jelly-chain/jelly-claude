import { getCache } from '../../../core/cache.mjs';

const cache = getCache('portfolio', { defaultTtlMs: 300_000 });

/**
 * Add an asset to the portfolio.
 */
export async function add(args = {}) {
  if (!args.asset) return { ok: false, error: 'Missing --asset' };
  if (!args.chain) return { ok: false, error: 'Missing --chain' };
  if (!args.amount) return { ok: false, error: 'Missing --amount' };

  const asset = args.asset.toUpperCase();
  const chain = args.chain.toLowerCase();
  const amount = parseFloat(args.amount);

  // Load existing portfolio
  const portfolio = await getPortfolio();
  const entry = portfolio.assets.find(a => a.asset === asset && a.chain === chain);
  if (entry) {
    entry.amount += amount;
  } else {
    portfolio.assets.push({ asset, chain, amount });
  }

  await savePortfolio(portfolio);
  return { ok: true, message: `Added ${amount} ${asset} on ${chain} to portfolio` };
}

/**
 * Remove an asset from the portfolio.
 */
export async function remove(args = {}) {
  if (!args.asset) return { ok: false, error: 'Missing --asset' };
  if (!args.chain) return { ok: false, error: 'Missing --chain' };

  const asset = args.asset.toUpperCase();
  const chain = args.chain.toLowerCase();

  const portfolio = await getPortfolio();
  const initialLength = portfolio.assets.length;
  portfolio.assets = portfolio.assets.filter(a => !(a.asset === asset && a.chain === chain));
  if (portfolio.assets.length === initialLength) return { ok: false, error: 'Asset not found in portfolio' };

  await savePortfolio(portfolio);
  return { ok: true, message: `Removed all ${asset} on ${chain} from portfolio` };
}

/**
 * List all assets in the portfolio with their current value.
 */
export async function list(args = {}) {
  const portfolio = await getPortfolio();
  // In a real implementation, we would fetch current prices and calculate USD values
  // For now, return mock values
  const totalValue = portfolio.assets.reduce((sum, a) => sum + a.amount * getMockPrice(a.asset, a.chain), 0);
  const assets = portfolio.assets.map(a => ({
    asset: a.asset,
    chain: a.chain,
    amount: a.amount,
    usdValue: a.amount * getMockPrice(a.asset, a.chain),
  }));

  return {
    ok: true,
    totalValue,
    assets,
  };
}

/**
 * Get portfolio history and performance.
 */
export async function history(args = {}) {
  const portfolio = await getPortfolio();
  // Mock history
  const history = [
    { date: '2024-01-01', value: 5000 },
    { date: '2024-02-01', value: 6000 },
    { date: '2024-03-01', value: 8000 },
    { date: '2024-04-01', value: 10000 },
    { date: '2024-05-01', value: 12000 },
  ];
  return { ok: true, history, current: portfolio.assets };
}

// Helper functions
async function getPortfolio() {
  const cached = await cache.get('portfolio');
  if (cached) return cached;
  const portfolio = { assets: [] };
  cache.set('portfolio', portfolio);
  return portfolio;
}

async function savePortfolio(portfolio) {
  cache.set('portfolio', portfolio);
}

function getMockPrice(asset, chain) {
  // Mock prices
  const prices = {
    SOL: { solana: 100 },
    ETH: { ethereum: 2000, bnb: 0.06, polygon: 0.06 },
    BTC: { bitcoin: 50000, ethereum: 0.02, bnb: 0.001 },
    USDC: { polygon: 1, ethereum: 1, bnb: 1, solana: 1 },
    USDT: { bitcoin: 1, ethereum: 1, bnb: 1, polygon: 1, solana: 1 },
    BNB: { bnb: 300 },
    MATIC: { polygon: 0.5 },
  };
  return prices[asset]?.[chain] || 1;
}
