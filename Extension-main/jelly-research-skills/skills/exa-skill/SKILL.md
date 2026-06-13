# Exa Skill — Neural Web Search & Semantic Discovery

## Overview
Exa (formerly Metaphor) is a neural search engine designed for LLM-based research workflows. Unlike keyword search, it understands semantic intent and returns precise, high-quality results from across the full web. It supports full-page content crawling, semantic similarity search, and structured data extraction.

## What you need
1. **Exa API key** — sign up at [exa.ai](https://exa.ai) → Dashboard → API Keys
2. Store key at `~/.jelly-research/.keys` as `EXA_API_KEY`

## API base URL
```
https://api.exa.ai
```

## Authentication
```typescript
import Exa from 'exa-js';

const exa = new Exa(process.env.EXA_API_KEY!);
```

Or with raw HTTP:
```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.exa.ai',
  headers: { 'x-api-key': process.env.EXA_API_KEY! },
});
```

## Install SDK
```bash
npm install exa-js
```

## Basic neural search

```typescript
import Exa from 'exa-js';
const exa = new Exa(process.env.EXA_API_KEY!);

// Neural search (semantic similarity)
const results = await exa.search('latest breakthroughs in protein folding', {
  type: 'neural',           // 'neural' | 'keyword' | 'auto'
  numResults: 10,
  useAutoprompt: true,      // enhances query automatically
});

results.results.forEach(r => {
  console.log(r.title, r.url, r.score);
});
```

## Search + fetch full content

```typescript
// Search and retrieve page text in one call
const results = await exa.searchAndContents(
  'venture capital funding AI startups 2025',
  {
    type: 'neural',
    numResults: 5,
    text: { maxCharacters: 5000 },   // include full page text
    highlights: {
      numSentences: 3,
      highlightsPerUrl: 2,
    },
  }
);

results.results.forEach(r => {
  console.log('---');
  console.log('Title:', r.title);
  console.log('URL:', r.url);
  console.log('Published:', r.publishedDate);
  console.log('Highlights:', r.highlights?.join('\n'));
  console.log('Text preview:', r.text?.slice(0, 500));
});
```

## Date-filtered search (news & recency)

```typescript
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const today = new Date().toISOString().split('T')[0];

const news = await exa.searchAndContents('OpenAI GPT-5 release', {
  type: 'auto',
  numResults: 8,
  startPublishedDate: yesterday,
  endPublishedDate: today,
  text: true,
});
```

## Find similar pages (semantic similarity)

```typescript
// Given a URL, find semantically similar pages
const similar = await exa.findSimilar('https://techcrunch.com/2025/01/01/article', {
  numResults: 10,
  excludeSourceDomain: true,  // exclude pages from the same site
});
```

## Domain-restricted research

```typescript
// Search only on specific domains
const academicResults = await exa.search('CRISPR gene editing clinical trials', {
  type: 'neural',
  numResults: 10,
  includeDomains: ['nature.com', 'science.org', 'nejm.org', 'pubmed.ncbi.nlm.nih.gov'],
});

// Exclude low-quality domains
const cleanResults = await exa.search('AI market share 2025', {
  type: 'neural',
  numResults: 10,
  excludeDomains: ['reddit.com', 'quora.com', 'wikipedia.org'],
  startPublishedDate: '2025-01-01',
});
```

## Get page content by URL (no search)

```typescript
const contents = await exa.getContents(['https://openai.com/blog/gpt-4', 'https://anthropic.com/blog/claude-3'], {
  text: { maxCharacters: 8000 },
  summary: { query: 'What is this about?' },
});

contents.results.forEach(r => {
  console.log(r.url);
  console.log('Summary:', r.summary);
  console.log('Text:', r.text?.slice(0, 1000));
});
```

## Extract structured data

```typescript
// Use Exa to extract specific fields from pages
async function extractCompanyInfo(companyUrl: string): Promise<{
  name: string;
  description: string;
  founders: string[];
  funding: string;
}> {
  const [result] = (await exa.getContents([companyUrl], {
    text: { maxCharacters: 10000 },
    summary: { query: 'company name, description, founders, funding raised' },
  })).results;

  // Parse the summary with your preferred LLM
  return JSON.parse(result.summary ?? '{}');
}
```

## Competitive research pipeline

```typescript
async function researchCompetitors(company: string): Promise<string[]> {
  // Step 1: Find competitors
  const compResults = await exa.search(`companies competing with ${company}`, {
    type: 'neural',
    numResults: 10,
    useAutoprompt: true,
  });

  // Step 2: Get content about each competitor
  const urls = compResults.results.map(r => r.url);
  const contents = await exa.getContents(urls, {
    text: { maxCharacters: 3000 },
  });

  return contents.results.map(r => `${r.title}: ${r.text?.slice(0, 500)}`);
}
```

## Rate limits & pricing
- **Free tier:** 1,000 searches/month
- **Paid plans:** $25/month (5,000 searches), $100/month (25,000 searches)
- **Content fetching:** +$0.001 per page fetched
- Rate limit: 10 RPS

## Error handling

```typescript
try {
  const results = await exa.search(query, { numResults: 10 });
} catch (err: any) {
  if (err.status === 401) throw new Error('Invalid EXA_API_KEY');
  if (err.status === 429) throw new Error('Exa rate limit — wait before retrying');
  if (err.status === 402) throw new Error('Exa quota exhausted — upgrade plan');
  throw err;
}
```

## Best practices
- Use `type: 'neural'` for conceptual searches, `'keyword'` for exact phrases, `'auto'` when unsure
- Enable `useAutoprompt: true` for better semantic matching on complex queries
- Fetch content in the same call as search (`searchAndContents`) to save API calls
- Limit `maxCharacters` to what you'll actually process — reduces cost
- Use `highlights` instead of full `text` for faster, cheaper context extraction
- Combine with Perplexity: use Exa to find URLs, Perplexity to synthesise answers
