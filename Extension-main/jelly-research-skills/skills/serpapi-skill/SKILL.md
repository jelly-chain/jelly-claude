# SerpAPI Skill — Google & Multi-Engine Search Results

## Overview
SerpAPI scrapes Google Search (and Bing, DuckDuckGo, Yahoo, YouTube, Google News, Google Scholar, Google Maps, and more) and returns clean, structured JSON results. It handles CAPTCHAs, proxies, and bot detection automatically.

## What you need
1. **SerpAPI key** — sign up at [serpapi.com](https://serpapi.com) → Dashboard → API Key
2. Store key at `~/.jelly-research/.keys` as `SERPAPI_KEY`

## API base URL
```
https://serpapi.com/search
```

## Authentication
```typescript
import { getJson } from 'serpapi';
// or raw HTTP:
import axios from 'axios';

const serp = async (params: Record<string, string>) =>
  (await axios.get('https://serpapi.com/search', {
    params: { ...params, api_key: process.env.SERPAPI_KEY! },
  })).data;
```

## Install SDK
```bash
npm install serpapi
```

## Google web search

```typescript
import { getJson } from 'serpapi';

interface OrganicResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
  displayed_link: string;
}

async function googleSearch(query: string, options: {
  numResults?: number;
  country?: string;   // 'us' | 'gb' | 'de' ...
  language?: string;  // 'en' | 'de' | 'fr' ...
  timeRange?: 'qdr:h' | 'qdr:d' | 'qdr:w' | 'qdr:m' | 'qdr:y';  // past hour/day/week/month/year
} = {}): Promise<OrganicResult[]> {
  const { numResults = 10, country = 'us', language = 'en', timeRange } = options;

  const result = await getJson({
    engine: 'google',
    q: query,
    api_key: process.env.SERPAPI_KEY!,
    num: numResults,
    gl: country,
    hl: language,
    ...(timeRange ? { tbs: timeRange } : {}),
  });

  return result.organic_results ?? [];
}

// Usage
const results = await googleSearch('best AI coding assistant 2025', {
  numResults: 10,
  timeRange: 'qdr:m', // last month
});

results.forEach(r => console.log(r.position, r.title, r.link));
```

## Google News search

```typescript
interface NewsResult {
  position: number;
  title: string;
  link: string;
  source: { name: string; icon: string };
  date: string;
  snippet: string;
}

async function googleNews(query: string, options: {
  numResults?: number;
  language?: string;
  timeRange?: 'qdr:h' | 'qdr:d' | 'qdr:w';
} = {}): Promise<NewsResult[]> {
  const result = await getJson({
    engine: 'google_news',
    q: query,
    api_key: process.env.SERPAPI_KEY!,
    hl: options.language ?? 'en',
    ...(options.timeRange ? { tbs: options.timeRange } : {}),
  });

  return result.news_results ?? [];
}
```

## Google Scholar search

```typescript
interface ScholarResult {
  title: string;
  link: string;
  result_id: string;
  publication_info: { summary: string; authors?: { name: string }[] };
  snippet: string;
  inline_links?: { cited_by?: { total: number } };
}

async function googleScholar(query: string, options: {
  yearFrom?: number;
  yearTo?: number;
  sortByDate?: boolean;
  numResults?: number;
} = {}): Promise<ScholarResult[]> {
  const result = await getJson({
    engine: 'google_scholar',
    q: query,
    api_key: process.env.SERPAPI_KEY!,
    as_ylo: options.yearFrom,
    as_yhi: options.yearTo,
    scisbd: options.sortByDate ? 1 : 0,
    num: options.numResults ?? 10,
  });

  return result.organic_results ?? [];
}

// Find highly cited papers
const papers = await googleScholar('transformer neural network architecture', {
  yearFrom: 2022,
  sortByDate: false, // sort by relevance
});
papers.forEach(p => {
  const citations = p.inline_links?.cited_by?.total ?? 0;
  console.log(`[${citations} citations] ${p.title}`);
});
```

## Google Images search

```typescript
async function googleImages(query: string, numResults = 10): Promise<{
  title: string;
  original: string;
  thumbnail: string;
  source: string;
}[]> {
  const result = await getJson({
    engine: 'google_images',
    q: query,
    api_key: process.env.SERPAPI_KEY!,
    num: numResults,
  });

  return (result.images_results ?? []).map((img: any) => ({
    title: img.title,
    original: img.original,
    thumbnail: img.thumbnail,
    source: img.source,
  }));
}
```

## SERP features extraction

```typescript
async function getFullSerpFeatures(query: string): Promise<{
  organic: OrganicResult[];
  answerBox?: { answer: string; snippet: string };
  knowledgeGraph?: { title: string; description: string };
  relatedSearches: string[];
  peopleAlsoAsk: { question: string; snippet: string }[];
}> {
  const result = await getJson({
    engine: 'google',
    q: query,
    api_key: process.env.SERPAPI_KEY!,
    num: 10,
  });

  return {
    organic: result.organic_results ?? [],
    answerBox: result.answer_box,
    knowledgeGraph: result.knowledge_graph,
    relatedSearches: (result.related_searches ?? []).map((s: any) => s.query),
    peopleAlsoAsk: (result.related_questions ?? []).map((q: any) => ({
      question: q.question,
      snippet: q.snippet,
    })),
  };
}
```

## Pagination & deep SERP crawl

```typescript
async function deepSearch(query: string, maxResults = 100): Promise<OrganicResult[]> {
  const all: OrganicResult[] = [];
  let start = 0;

  while (all.length < maxResults) {
    const result = await getJson({
      engine: 'google',
      q: query,
      api_key: process.env.SERPAPI_KEY!,
      num: 10,
      start,
    });

    const batch: OrganicResult[] = result.organic_results ?? [];
    all.push(...batch);

    if (batch.length < 10) break; // no more results
    start += 10;
    await new Promise(r => setTimeout(r, 500)); // polite delay
  }

  return all.slice(0, maxResults);
}
```

## Rate limits & pricing
- **Free:** 100 searches/month
- **Starter:** $75/month — 5,000 searches
- **Production:** $150/month — 15,000 searches
- Rate limit: 1 RPS on free, 5 RPS on paid

## Error handling

```typescript
try {
  const results = await googleSearch('test query');
} catch (err: any) {
  if (err.response?.status === 401 || err.message?.includes('Invalid API key')) {
    throw new Error('Invalid SERPAPI_KEY — check serpapi.com dashboard');
  }
  if (err.message?.includes('quota')) {
    throw new Error('SerpAPI monthly quota exhausted — upgrade plan');
  }
  throw err;
}
```

## Best practices
- Use Google News engine for news; Google Scholar for academic; Google for general web
- Extract `answer_box` and `knowledge_graph` for quick facts before reading organic results
- SerpAPI is expensive at scale — cache results and don't re-query the same term within an hour
- Combine with Firecrawl to read the full content of top results
- Use `tbs=qdr:h` for freshest results, `qdr:d` for today's news
