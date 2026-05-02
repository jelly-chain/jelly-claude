# Tavily Skill — AI-Optimized Search for LLM Agents

## Overview
Tavily is a search API purpose-built for LLM agents. It aggregates results from multiple sources, extracts relevant content, and returns clean, structured data that's ready for LLM consumption — without you needing to scrape or parse HTML. It includes both search and a built-in Q&A endpoint.

## What you need
1. **Tavily API key** — sign up at [app.tavily.com](https://app.tavily.com) → API Keys
2. Store key at `~/.jelly-research/.keys` as `TAVILY_API_KEY`

## API base URL
```
https://api.tavily.com
```

## Authentication
```typescript
import { TavilyClient } from '@tavily/core';

const tavily = new TavilyClient({ apiKey: process.env.TAVILY_API_KEY! });
```

Or raw HTTP:
```typescript
import axios from 'axios';

const tavilyPost = async (endpoint: string, body: object) =>
  (await axios.post(`https://api.tavily.com${endpoint}`, {
    api_key: process.env.TAVILY_API_KEY!,
    ...body,
  })).data;
```

## Install SDK
```bash
npm install @tavily/core
```

## Basic search

```typescript
import { TavilyClient } from '@tavily/core';
const tavily = new TavilyClient({ apiKey: process.env.TAVILY_API_KEY! });

interface TavilySearchOptions {
  searchDepth?: 'basic' | 'advanced';   // advanced = deeper crawl, costs 2 credits
  topic?: 'general' | 'news';
  days?: number;                          // news recency (topic: 'news' only)
  maxResults?: number;                    // default 5, max 20
  includeImages?: boolean;
  includeImageDescriptions?: boolean;
  includeAnswer?: boolean;                // include LLM-synthesized answer
  includeRawContent?: boolean;            // include full page HTML
  includeDomains?: string[];
  excludeDomains?: string[];
}

async function search(query: string, options: TavilySearchOptions = {}) {
  return await tavily.search(query, {
    searchDepth: options.searchDepth ?? 'basic',
    topic: options.topic ?? 'general',
    maxResults: options.maxResults ?? 5,
    includeAnswer: options.includeAnswer ?? true,
    ...options,
  });
}

const result = await search('What are the main differences between GPT-4 and Claude 3.5?', {
  searchDepth: 'advanced',
  includeAnswer: true,
  maxResults: 8,
});

console.log('Answer:', result.answer);
result.results.forEach(r => {
  console.log(`[${r.score.toFixed(2)}] ${r.title}`);
  console.log('URL:', r.url);
  console.log('Content:', r.content.slice(0, 300));
});
```

## News search

```typescript
async function latestNews(topic: string, daysBack = 3): Promise<{
  answer: string;
  articles: Array<{ title: string; url: string; content: string; publishedDate: string }>;
}> {
  const result = await tavily.search(topic, {
    searchDepth: 'basic',
    topic: 'news',
    days: daysBack,
    maxResults: 10,
    includeAnswer: true,
  });

  return {
    answer: result.answer ?? '',
    articles: result.results.map(r => ({
      title: r.title,
      url: r.url,
      content: r.content,
      publishedDate: r.publishedDate ?? '',
    })),
  };
}

const news = await latestNews('Federal Reserve interest rate decision', 1);
console.log('Summary:', news.answer);
```

## Q&A endpoint (simple question → direct answer)

```typescript
async function askQuestion(question: string): Promise<string> {
  const answer = await tavily.qna(question);
  return answer;
}

// Best for factual questions
const answers = await Promise.all([
  askQuestion('What is the current price of gold per ounce?'),
  askQuestion('Who is the current CEO of Anthropic?'),
  askQuestion('What is the GDP of Germany in 2024?'),
]);
```

## Extract content from specific URLs

```typescript
async function extractContent(urls: string[]): Promise<Array<{
  url: string;
  rawContent: string | null;
  failedResults: string[];
}>> {
  const result = await tavily.extract(urls);
  return result.results.map(r => ({
    url: r.url,
    rawContent: r.rawContent,
    failedResults: result.failedResults,
  }));
}

const content = await extractContent([
  'https://openai.com/research/gpt-4',
  'https://anthropic.com/claude',
]);
```

## Advanced research pipeline

```typescript
interface ResearchReport {
  query: string;
  answer: string;
  sources: string[];
  keyFindings: string[];
}

async function conductResearch(query: string): Promise<ResearchReport> {
  // Phase 1: broad search
  const broad = await tavily.search(query, {
    searchDepth: 'advanced',
    maxResults: 10,
    includeAnswer: true,
  });

  // Phase 2: extract full content from top 3 sources
  const topUrls = broad.results.slice(0, 3).map(r => r.url);
  const fullContent = await tavily.extract(topUrls);

  // Phase 3: gather key findings from content
  const keyFindings = broad.results
    .slice(0, 5)
    .map(r => `• [${r.title}] ${r.content.slice(0, 200)}...`);

  return {
    query,
    answer: broad.answer ?? 'No synthesised answer available',
    sources: broad.results.map(r => r.url),
    keyFindings,
  };
}
```

## Domain-focused search

```typescript
// Research restricted to authoritative sources
const financialResearch = await tavily.search('Q1 2025 earnings reports big tech', {
  searchDepth: 'advanced',
  includeDomains: ['wsj.com', 'ft.com', 'bloomberg.com', 'reuters.com', 'cnbc.com'],
  maxResults: 10,
  includeAnswer: true,
});

// Exclude content farms
const cleanSearch = await tavily.search('best practices kubernetes deployment', {
  excludeDomains: ['medium.com', 'dev.to'],
  searchDepth: 'basic',
  maxResults: 8,
});
```

## Rate limits & pricing
- **Free:** 1,000 credits/month (basic search = 1 credit, advanced = 2 credits)
- **Base:** $35/month — 4,000 credits
- **Pro:** $100/month — 16,000 credits
- No rate limit on requests per second (within credit budget)

## Error handling

```typescript
try {
  const result = await tavily.search(query);
} catch (err: any) {
  if (err.status === 401) throw new Error('Invalid TAVILY_API_KEY');
  if (err.status === 429) throw new Error('Tavily credit limit exceeded — check usage at app.tavily.com');
  throw new Error(`Tavily error: ${err.message}`);
}
```

## Best practices
- Tavily's `includeAnswer` provides a ready-made summary — use it as your starting point
- Use `searchDepth: 'advanced'` only for in-depth research tasks (costs 2x credits)
- Use `topic: 'news'` with `days: 1` for breaking news monitoring
- Tavily is faster than Exa for synthesis but Exa is better for finding specific sources
- Cache answers for repeated queries — same question within 1 hour returns same data
- Always show `result.url` alongside content — LLMs must cite their sources
