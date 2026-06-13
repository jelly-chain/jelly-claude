import { metrics }      from '../core/metrics.mjs';
import { audit }        from '../core/audit.mjs';
import { createLogger } from '../core/logger.mjs';

const log = createLogger('news-alpha-scout');

export class NewsAlphaScoutAgent {
  constructor(opts = {}) {
    this._sources = opts.sources || ['twitter', 'reddit', 'news'];
    this._keywords = opts.keywords || [];
  }

  async execute(input, memory) {
    const t = metrics.startTimer('news-alpha-scout.execute');
    metrics.incMetric('news_alpha.calls');

    const { action } = input;

    switch (action) {
      case 'scan':
        return this.scan(input.query, memory);
      case 'trending':
        return this.getTrending(input.chain, memory);
      case 'impact_score':
        return this.impactScore(input.event, memory);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async scan(query, memory) {
    const results = {
      query,
      sources: this._sources,
      articles: await this._fetchArticles(query),
      timestamp: Date.now(),
    };

    const scored = results.articles.map(a => ({
      ...a,
      alphaScore: this._calculateAlphaScore(a),
    })).sort((a, b) => b.alphaScore - a.alphaScore);

    results.topAlpha = scored.slice(0, 5);

    audit.newsScan({ query, count: results.articles.length });

    if (memory) {
      await memory.set('lastNewsScan', results);
      memory.history.push({ type: 'news_scan', ...results });
    }

    return results;
  }

  async getTrending(chain, memory) {
    const trending = {
      chain,
      topics: await this._getTrendingTopics(chain),
      volume: Math.floor(Math.random() * 100),
      sentiment: Math.random() * 2 - 1,
    };

    if (memory) {
      memory.history.push({ type: 'trending', ...trending });
    }

    return trending;
  }

  impactScore(event, memory) {
    const score = Math.random() * 1;
    const result = {
      event,
      score,
      level: score > 0.8 ? 'high' : score > 0.5 ? 'medium' : 'low',
    };

    if (memory) {
      memory.history.push({ type: 'impact_score', ...result });
    }

    return result;
  }

  async _fetchArticles(query) {
    return [
      { title: `${query} update`, source: 'news', sentiment: 0.5 },
      { title: `Breaking: ${query}`, source: 'twitter', sentiment: 0.8 },
    ];
  }

  _calculateAlphaScore(article) {
    const factors = {
      source: article.source === 'twitter' ? 0.8 : 0.5,
      sentiment: Math.abs(article.sentiment) * 0.5,
      recency: 0.7,
    };
    return Object.values(factors).reduce((a, b) => a + b, 0) / Object.keys(factors).length;
  }

  _getTrendingTopics(chain) {
    return ['meme', 'defi', 'nft'].map(t => ({ topic: t, score: Math.random() }));
  }
}

export default NewsAlphaScoutAgent;