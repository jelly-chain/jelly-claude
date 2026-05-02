# NewsAPI Skill — Real-Time News Search & Headlines

## Overview
NewsAPI provides access to breaking news and historical articles from 80,000+ news sources and blogs worldwide. It exposes two primary endpoints: top headlines (latest breaking news) and everything (full historical archive search).

## What you need
1. **NewsAPI key** — sign up at [newsapi.org](https://newsapi.org) → Get API Key
2. Store key at `~/.jelly-research/.keys` as `NEWSAPI_KEY`

## API base URL
```
https://newsapi.org/v2
```

**Note:** Free tier is developer-only (not for production use, delayed by 24h on some plans, 100 req/day). Paid plans start at $449/month for commercial use.

## Authentication
```typescript
import axios from 'axios';

const newsClient = axios.create({
  baseURL: 'https://newsapi.org/v2',
  headers: { 'X-Api-Key': process.env.NEWSAPI_KEY! },
});
```

## Get top headlines

```typescript
interface NewsArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface HeadlinesParams {
  country?: 'us' | 'gb' | 'au' | 'ca' | 'in' | string;
  category?: 'business' | 'entertainment' | 'general' | 'health' | 'science' | 'sports' | 'technology';
  sources?: string;     // comma-separated source IDs
  q?: string;           // keyword search within headlines
  pageSize?: number;    // max 100
  page?: number;
}

async function getTopHeadlines(params: HeadlinesParams): Promise<NewsArticle[]> {
  const response = await newsClient.get('/top-headlines', { params });
  if (response.data.status !== 'ok') throw new Error(response.data.message);
  return response.data.articles;
}

// Examples
const techNews = await getTopHeadlines({ category: 'technology', country: 'us', pageSize: 20 });
const aiHeadlines = await getTopHeadlines({ q: 'artificial intelligence', pageSize: 10 });
const bbc = await getTopHeadlines({ sources: 'bbc-news,reuters', pageSize: 20 });
```

## Search everything (full archive)

```typescript
interface EverythingParams {
  q: string;             // keywords or phrases — supports AND, OR, NOT, "exact phrase"
  sources?: string;
  domains?: string;      // comma-separated: 'techcrunch.com,wsj.com'
  excludeDomains?: string;
  from?: string;         // ISO8601: '2025-01-01'
  to?: string;
  language?: 'ar'|'de'|'en'|'es'|'fr'|'he'|'it'|'nl'|'no'|'pt'|'ru'|'sv'|'ud'|'zh';
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
  pageSize?: number;     // max 100
  page?: number;
}

async function searchEverything(params: EverythingParams): Promise<{
  totalResults: number;
  articles: NewsArticle[];
}> {
  const response = await newsClient.get('/everything', { params });
  if (response.data.status !== 'ok') throw new Error(response.data.message);
  return { totalResults: response.data.totalResults, articles: response.data.articles };
}

// Search examples
const aiNews = await searchEverything({
  q: '"artificial intelligence" AND (OpenAI OR Anthropic OR Google)',
  from: '2025-01-01',
  sortBy: 'publishedAt',
  language: 'en',
  pageSize: 50,
});

const marketNews = await searchEverything({
  q: 'stock market crash OR recession OR inflation',
  from: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
  sortBy: 'popularity',
  language: 'en',
});
```

## Paginate through all results

```typescript
async function getAllArticles(query: string, maxArticles = 200): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];
  let page = 1;
  const pageSize = 100;

  while (articles.length < maxArticles) {
    const { totalResults, articles: batch } = await searchEverything({
      q: query,
      sortBy: 'publishedAt',
      pageSize,
      page,
      language: 'en',
    });

    articles.push(...batch);
    if (articles.length >= totalResults || batch.length < pageSize) break;
    page++;
    await new Promise(r => setTimeout(r, 1000)); // respect rate limits
  }

  return articles.slice(0, maxArticles);
}
```

## Get available news sources

```typescript
async function getSources(category?: string, country?: string): Promise<{
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  country: string;
}[]> {
  const response = await newsClient.get('/top-headlines/sources', {
    params: { category, country, language: 'en' },
  });
  return response.data.sources;
}

// All tech sources
const techSources = await getSources('technology');
const usSources = await getSources(undefined, 'us');
```

## News monitoring loop

```typescript
async function monitorKeyword(
  keyword: string,
  intervalMs = 300000, // 5 minutes
  onNewArticle: (article: NewsArticle) => void
): Promise<() => void> {
  const seen = new Set<string>();

  const check = async () => {
    const { articles } = await searchEverything({
      q: keyword,
      from: new Date(Date.now() - intervalMs * 2).toISOString(),
      sortBy: 'publishedAt',
      pageSize: 20,
    });

    for (const article of articles) {
      if (!seen.has(article.url)) {
        seen.add(article.url);
        onNewArticle(article);
      }
    }
  };

  await check(); // run immediately
  const timer = setInterval(check, intervalMs);
  return () => clearInterval(timer); // returns stop function
}

// Usage
const stop = await monitorKeyword('Federal Reserve interest rates', 60000, article => {
  console.log('NEW:', article.publishedAt, article.title);
  console.log('URL:', article.url);
});
```

## Format article summaries

```typescript
function formatArticle(article: NewsArticle): string {
  const date = new Date(article.publishedAt).toLocaleString();
  return [
    `**${article.title}**`,
    `Source: ${article.source.name} | ${date}`,
    article.description ? `Summary: ${article.description}` : '',
    `URL: ${article.url}`,
  ].filter(Boolean).join('\n');
}

function formatHeadlinesList(articles: NewsArticle[]): string {
  return articles
    .slice(0, 10)
    .map((a, i) => `${i + 1}. [${a.source.name}] ${a.title} — ${a.url}`)
    .join('\n');
}
```

## Rate limits
- **Free:** 100 req/day, no commercial use, 1 month archive
- **Developer:** $449/month — unlimited requests, 1 month archive
- **Business:** Custom pricing — full archive back to 2017

## Error handling

```typescript
try {
  const articles = await getTopHeadlines({ q: 'Bitcoin' });
} catch (err: any) {
  const msg = err.response?.data?.message ?? err.message;
  if (err.response?.status === 401) throw new Error('Invalid NEWSAPI_KEY');
  if (err.response?.status === 426) throw new Error('NewsAPI: free tier cannot use this endpoint in production — upgrade plan');
  if (err.response?.status === 429) throw new Error('NewsAPI rate limit exceeded');
  throw new Error(`NewsAPI error: ${msg}`);
}
```

## Best practices
- Combine with Perplexity or Exa for synthesis — NewsAPI gives you raw articles
- Use `sortBy: 'publishedAt'` for monitoring, `'popularity'` for top coverage
- Cache results locally — avoid fetching the same headlines repeatedly
- NewsAPI free tier has a 24-hour delay; for real-time news use a paid plan
- Use `domains` filter to get quality sources only
