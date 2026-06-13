# Firecrawl Skill — Web Scraping & Content Extraction

## Overview
Firecrawl converts any website into clean, structured markdown or JSON data that LLMs can consume. It handles JavaScript rendering, dynamic content, CAPTCHAs, anti-bot measures, and sitemap crawling. It's the best way to extract full web page content for research pipelines.

## What you need
1. **Firecrawl API key** — sign up at [firecrawl.dev](https://www.firecrawl.dev) → Dashboard
2. Store key at `~/.jelly-research/.keys` as `FIRECRAWL_API_KEY`

## API base URL
```
https://api.firecrawl.dev/v1
```

## Authentication
```typescript
import FirecrawlApp from '@mendable/firecrawl-js';

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });
```

## Install SDK
```bash
npm install @mendable/firecrawl-js
```

## Scrape a single URL

```typescript
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';
const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });

interface ScrapeOptions {
  formats?: ('markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot' | 'json')[];
  onlyMainContent?: boolean;   // removes nav, footer, ads
  includeTags?: string[];      // HTML tags to include
  excludeTags?: string[];      // HTML tags to exclude
  waitFor?: number;            // ms to wait after page load (for dynamic content)
  actions?: FirecrawlAction[]; // click, type, wait actions
}

async function scrapePage(url: string, options: ScrapeOptions = {}): Promise<{
  markdown: string;
  links: string[];
  metadata: Record<string, string>;
}> {
  const result = await app.scrapeUrl(url, {
    formats: ['markdown', 'links'],
    onlyMainContent: true,
    ...options,
  }) as ScrapeResponse;

  if (!result.success) throw new Error(`Scrape failed: ${result.error}`);

  return {
    markdown: result.markdown ?? '',
    links: result.links ?? [],
    metadata: result.metadata ?? {},
  };
}

// Basic usage
const page = await scrapePage('https://news.ycombinator.com');
console.log(page.markdown.slice(0, 2000));
```

## Crawl an entire website

```typescript
interface CrawlOptions {
  maxDepth?: number;          // default 2
  limit?: number;             // max pages to crawl
  allowedDomains?: string[];
  excludePaths?: string[];    // regex patterns to exclude
  scrapeOptions?: ScrapeOptions;
}

async function crawlSite(url: string, options: CrawlOptions = {}): Promise<{
  pages: Array<{ url: string; markdown: string; metadata: Record<string, any> }>;
  total: number;
}> {
  const result = await app.crawlUrl(url, {
    limit: options.limit ?? 50,
    maxDepth: options.maxDepth ?? 2,
    scrapeOptions: {
      formats: ['markdown'],
      onlyMainContent: true,
      ...options.scrapeOptions,
    },
    ...(options.excludePaths ? { excludePaths: options.excludePaths } : {}),
  });

  if (!result.success) throw new Error(`Crawl failed`);

  return {
    pages: (result.data ?? []).map((p: any) => ({
      url: p.metadata?.sourceURL ?? '',
      markdown: p.markdown ?? '',
      metadata: p.metadata ?? {},
    })),
    total: result.data?.length ?? 0,
  };
}

// Crawl a docs site
const docs = await crawlSite('https://docs.example.com', {
  maxDepth: 3,
  limit: 100,
  excludePaths: ['/blog', '/changelog'],
});

console.log(`Crawled ${docs.total} pages`);
```

## Map site (get all URLs without content)

```typescript
async function mapSite(url: string, options: {
  search?: string;           // filter URLs by keyword
  limit?: number;
} = {}): Promise<string[]> {
  const result = await app.mapUrl(url, {
    search: options.search,
    limit: options.limit ?? 500,
  });

  if (!result.success) throw new Error('Map failed');
  return result.links ?? [];
}

// Get all blog post URLs
const blogUrls = await mapSite('https://openai.com', { search: '/blog' });
console.log(`Found ${blogUrls.length} blog posts`);
```

## Extract structured data (schema-based)

```typescript
import { z } from 'zod';

// Define the schema for what you want to extract
const CompanySchema = z.object({
  name: z.string(),
  description: z.string(),
  founded: z.string().optional(),
  founders: z.array(z.string()).optional(),
  funding: z.string().optional(),
  headquarters: z.string().optional(),
  employees: z.string().optional(),
  products: z.array(z.string()),
});

async function extractCompanyData(url: string) {
  const result = await app.scrapeUrl(url, {
    formats: ['extract'],
    extract: {
      schema: CompanySchema,
      systemPrompt: 'Extract company information from the page. Be precise.',
    },
  }) as ScrapeResponse;

  return result.extract as z.infer<typeof CompanySchema>;
}

const company = await extractCompanyData('https://anthropic.com/about');
console.log(company);
```

## Dynamic content — wait for JS + interact

```typescript
type FirecrawlAction =
  | { type: 'wait'; milliseconds: number }
  | { type: 'click'; selector: string }
  | { type: 'type'; selector: string; text: string }
  | { type: 'scroll'; direction: 'up' | 'down'; amount: number }
  | { type: 'screenshot' };

async function scrapeDynamicPage(url: string): Promise<string> {
  const result = await app.scrapeUrl(url, {
    formats: ['markdown'],
    onlyMainContent: true,
    waitFor: 3000,          // wait 3s for JS
    actions: [
      { type: 'scroll', direction: 'down', amount: 3 },
      { type: 'wait', milliseconds: 1000 },
    ],
  }) as ScrapeResponse;

  return result.markdown ?? '';
}
```

## Batch scraping multiple URLs

```typescript
async function batchScrape(urls: string[]): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  // Process in chunks of 5 to avoid overwhelming the API
  for (let i = 0; i < urls.length; i += 5) {
    const chunk = urls.slice(i, i + 5);
    const scraped = await Promise.allSettled(
      chunk.map(url => scrapePage(url))
    );

    chunk.forEach((url, j) => {
      const result = scraped[j];
      if (result.status === 'fulfilled') {
        results.set(url, result.value.markdown);
      } else {
        results.set(url, `ERROR: ${result.reason?.message}`);
      }
    });

    await new Promise(r => setTimeout(r, 1000)); // rate limit pause
  }

  return results;
}
```

## Research pipeline: search + scrape

```typescript
async function researchAndScrape(
  query: string,
  searchResults: Array<{ url: string; title: string }>
): Promise<string> {
  // Scrape the top 3 results for full content
  const top3 = searchResults.slice(0, 3);
  const contents = await batchScrape(top3.map(r => r.url));

  const report: string[] = [`# Research: ${query}\n`];

  for (const result of top3) {
    const content = contents.get(result.url) ?? 'Failed to scrape';
    report.push(`## ${result.title}`);
    report.push(`URL: ${result.url}`);
    report.push(content.slice(0, 3000));
    report.push('---');
  }

  return report.join('\n\n');
}
```

## Rate limits & pricing
- **Free:** 500 credits/month (1 credit per page scrape)
- **Starter:** $16/month — 3,000 credits
- **Standard:** $83/month — 100,000 credits
- Rate limit: 5 RPS on free, 20 RPS on paid

## Error handling

```typescript
try {
  const result = await scrapePage(url);
} catch (err: any) {
  if (err.message?.includes('401')) throw new Error('Invalid FIRECRAWL_API_KEY');
  if (err.message?.includes('429')) throw new Error('Firecrawl rate limit — slow down');
  if (err.message?.includes('402')) throw new Error('Firecrawl credits exhausted — upgrade plan');
  if (err.message?.includes('timeout')) throw new Error(`Page ${url} timed out — site may be blocking scrapers`);
  throw err;
}
```

## Best practices
- Use `onlyMainContent: true` to strip nav, ads, footer — saves tokens
- Use `mapUrl` first to find target pages before crawling
- Use schema-based `extract` for structured data — much faster than parsing markdown manually
- Combine with Tavily/SerpAPI: use search to find URLs, Firecrawl to get full content
- For SPAs and JavaScript-heavy sites, set `waitFor: 2000-5000` ms
- Respect `robots.txt` — Firecrawl checks it by default on crawl mode
