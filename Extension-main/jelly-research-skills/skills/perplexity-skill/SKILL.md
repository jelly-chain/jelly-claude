# Perplexity Skill — AI-Powered Search & Research

## Overview
Perplexity AI provides an LLM-powered search API that returns synthesized, cited answers to queries in real time. It's ideal for research questions that require fresh web data rather than pre-training knowledge.

## What you need
1. **Perplexity API key** — sign up at [perplexity.ai](https://www.perplexity.ai) → API → Create Key
2. Store key at `~/.jelly-research/.keys` as `PERPLEXITY_API_KEY`

## API base URL
```
https://api.perplexity.ai
```

## Authentication
```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.perplexity.ai',
  headers: {
    Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    'Content-Type': 'application/json',
  },
});
```

## Available models
| Model | Context | Best for |
|-------|---------|---------|
| `sonar` | 127k | Fast, real-time web search |
| `sonar-pro` | 200k | Deep research, complex queries |
| `sonar-reasoning` | 127k | Step-by-step reasoning + search |
| `sonar-reasoning-pro` | 200k | Complex multi-step research |

## Basic search query

```typescript
interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function search(query: string, options: {
  model?: string;
  focusMode?: 'internet' | 'news' | 'scholar' | 'youtube';
  returnSources?: boolean;
} = {}): Promise<{ answer: string; sources: string[] }> {
  const { model = 'sonar', focusMode = 'internet', returnSources = true } = options;

  const response = await client.post('/chat/completions', {
    model,
    messages: [
      {
        role: 'system',
        content: 'Be precise and concise. Always cite your sources.',
      },
      { role: 'user', content: query },
    ],
    search_domain_filter: [],
    return_citations: returnSources,
    search_recency_filter: 'month',  // 'hour' | 'day' | 'week' | 'month'
  });

  const answer = response.data.choices[0].message.content;
  const citations = response.data.citations ?? [];
  return { answer, sources: citations };
}

// Usage
const { answer, sources } = await search(
  'What are the latest AI model releases in 2025?',
  { model: 'sonar-pro', focusMode: 'news' }
);
console.log(answer);
console.log('Sources:', sources);
```

## Deep research with reasoning

```typescript
async function deepResearch(topic: string): Promise<string> {
  const response = await client.post('/chat/completions', {
    model: 'sonar-reasoning-pro',
    messages: [
      {
        role: 'system',
        content: `You are a professional research analyst.
Provide a comprehensive, well-structured report with:
1. Executive summary (3-5 bullets)
2. Key findings
3. Current state / recent developments
4. Implications and analysis
5. Sources and citations`,
      },
      { role: 'user', content: `Write a detailed research report on: ${topic}` },
    ],
    return_citations: true,
    search_recency_filter: 'week',
  });

  return response.data.choices[0].message.content;
}
```

## News-focused search

```typescript
async function latestNews(topic: string, recency: 'hour' | 'day' | 'week' = 'day'): Promise<{
  summary: string;
  sources: string[];
}> {
  const response = await client.post('/chat/completions', {
    model: 'sonar',
    messages: [
      {
        role: 'system',
        content: 'Summarise the latest news. List 5-7 key stories with dates and sources.',
      },
      { role: 'user', content: `Latest news about: ${topic}` },
    ],
    return_citations: true,
    search_recency_filter: recency,
    search_domain_filter: ['reuters.com', 'bloomberg.com', 'techcrunch.com', 'wsj.com'],
  });

  return {
    summary: response.data.choices[0].message.content,
    sources: response.data.citations ?? [],
  };
}
```

## Academic / scholar search

```typescript
async function scholarSearch(query: string): Promise<string> {
  const response = await client.post('/chat/completions', {
    model: 'sonar-pro',
    messages: [
      {
        role: 'system',
        content: 'You are a research librarian. Cite academic sources (arXiv, PubMed, Google Scholar, journals).',
      },
      { role: 'user', content: query },
    ],
    return_citations: true,
    search_domain_filter: ['arxiv.org', 'pubmed.ncbi.nlm.nih.gov', 'semanticscholar.org'],
  });

  return response.data.choices[0].message.content;
}
```

## Multi-turn conversation (research chat)

```typescript
const conversation: PerplexityMessage[] = [
  { role: 'system', content: 'You are a research assistant. Be thorough and cite all sources.' },
];

async function chat(userMessage: string): Promise<string> {
  conversation.push({ role: 'user', content: userMessage });

  const response = await client.post('/chat/completions', {
    model: 'sonar-pro',
    messages: conversation,
    return_citations: true,
  });

  const assistantMessage = response.data.choices[0].message.content;
  conversation.push({ role: 'assistant', content: assistantMessage });
  return assistantMessage;
}

// Build a research thread
await chat('What is Perplexity AI and who are its investors?');
await chat('How does its revenue model compare to Google Search?');
await chat('What is its current valuation?');
```

## Rate limits & pricing
- `sonar`: $0.20 per 1M input tokens + $0.80/1M output + $5/1000 requests
- `sonar-pro`: $3/1M input + $15/1M output + $5/1000 requests
- `sonar-reasoning-pro`: $2/1M input + $8/1M output
- Rate limit: 50 RPM (requests per minute) for standard tier

## Error handling

```typescript
import { AxiosError } from 'axios';

async function safeSearch(query: string): Promise<string> {
  try {
    const { answer } = await search(query);
    return answer;
  } catch (err) {
    const error = err as AxiosError<{ error: { message: string } }>;
    const msg = error.response?.data?.error?.message ?? error.message;
    if (error.response?.status === 429) throw new Error('Rate limit hit — wait 60s before retrying');
    if (error.response?.status === 401) throw new Error('Invalid PERPLEXITY_API_KEY');
    throw new Error(`Perplexity API error: ${msg}`);
  }
}
```

## Best practices
- Use `sonar` for quick lookups; `sonar-pro` for comprehensive reports
- Set `search_recency_filter: 'day'` for news, `'month'` for general research
- Use `search_domain_filter` to restrict to trusted sources
- Always surface citations to the user — never present AI summaries as authoritative without sources
- For long research tasks, break into sub-questions and call multiple times
