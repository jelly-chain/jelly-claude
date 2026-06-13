# OpenRouter Skill — Multi-Model AI Routing

## Overview
OpenRouter provides a unified OpenAI-compatible API that routes requests to 200+ AI models from OpenAI, Anthropic, Google, Meta, Mistral, Perplexity, and open-source providers. It handles fallbacks, load balancing, and model selection — letting you switch providers with a single parameter change.

## What you need
1. **OpenRouter API key** — sign up at [openrouter.ai](https://openrouter.ai) → Keys
2. Store key at `~/.jelly-ai/.keys` as `OPENROUTER_API_KEY`

## API base URL
```
https://openrouter.ai/api/v1
```

## Authentication
OpenRouter is fully OpenAI-compatible — use the OpenAI SDK with a different base URL:

```typescript
import OpenAI from 'openai';

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/jelly-chain/jelly-ai',  // identifies your app
    'X-Title': 'Jelly-AI Agent',
  },
});
```

## Top models quick reference

### Free models (no cost)
| Model | Provider | Strengths |
|-------|----------|-----------|
| `deepseek/deepseek-chat:free` | DeepSeek | Strong coding, reasoning |
| `deepseek/deepseek-r1:free` | DeepSeek | Chain-of-thought reasoning |
| `meta-llama/llama-3.3-70b-instruct:free` | Meta | General purpose, fast |
| `google/gemma-3-27b-it:free` | Google | Instruction following |
| `mistralai/mistral-7b-instruct:free` | Mistral | Lightweight, fast |

### Paid models (best quality)
| Model | Provider | Best for | Cost |
|-------|----------|----------|------|
| `anthropic/claude-opus-4` | Anthropic | Complex reasoning | $15/1M in |
| `anthropic/claude-sonnet-4-5` | Anthropic | Balanced quality | $3/1M in |
| `openai/gpt-4o` | OpenAI | Vision, general | $2.50/1M in |
| `openai/gpt-4o-mini` | OpenAI | Fast, cheap | $0.15/1M in |
| `google/gemini-pro-1.5` | Google | Long context (2M) | $3.50/1M in |
| `mistralai/mixtral-8x22b-instruct` | Mistral | Mixed expert | $0.90/1M in |
| `x-ai/grok-2-1212` | xAI | Real-time data | $2/1M in |

## Basic chat completion

```typescript
import OpenAI from 'openai';

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
});

const response = await openrouter.chat.completions.create({
  model: 'anthropic/claude-sonnet-4-5',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain the difference between supervised and unsupervised learning.' },
  ],
  temperature: 0.7,
  max_tokens: 1024,
});

console.log(response.choices[0].message.content);
// OpenRouter always returns model used:
console.log('Model used:', response.model);
```

## Model routing by task type

```typescript
interface RouterOptions {
  task: 'reasoning' | 'coding' | 'creative' | 'summarize' | 'qa' | 'multimodal';
  budget?: 'free' | 'cheap' | 'quality';
}

function selectModel(options: RouterOptions): string {
  const { task, budget = 'cheap' } = options;

  const matrix: Record<string, Record<string, string>> = {
    reasoning: {
      free:    'deepseek/deepseek-r1:free',
      cheap:   'deepseek/deepseek-r1',
      quality: 'anthropic/claude-opus-4',
    },
    coding: {
      free:    'deepseek/deepseek-chat:free',
      cheap:   'anthropic/claude-sonnet-4-5',
      quality: 'anthropic/claude-opus-4',
    },
    creative: {
      free:    'meta-llama/llama-3.3-70b-instruct:free',
      cheap:   'openai/gpt-4o-mini',
      quality: 'openai/gpt-4o',
    },
    summarize: {
      free:    'meta-llama/llama-3.3-70b-instruct:free',
      cheap:   'mistralai/mistral-7b-instruct',
      quality: 'anthropic/claude-sonnet-4-5',
    },
    qa: {
      free:    'google/gemma-3-27b-it:free',
      cheap:   'openai/gpt-4o-mini',
      quality: 'openai/gpt-4o',
    },
    multimodal: {
      free:    'meta-llama/llama-3.2-11b-vision-instruct:free',
      cheap:   'openai/gpt-4o-mini',
      quality: 'openai/gpt-4o',
    },
  };

  return matrix[task][budget];
}

// Usage
const model = selectModel({ task: 'coding', budget: 'quality' });
const response = await openrouter.chat.completions.create({
  model,
  messages: [{ role: 'user', content: 'Write a TypeScript binary search implementation' }],
});
```

## Provider fallbacks (auto-retry on failure)

```typescript
const response = await openrouter.chat.completions.create({
  model: 'anthropic/claude-sonnet-4-5',
  messages,
  // OpenRouter-specific: try these models if primary fails
  // @ts-ignore — OpenRouter extension
  route: 'fallback',
  // Alternative: specify fallback models manually:
  extra_body: {
    models: [
      'anthropic/claude-sonnet-4-5',
      'openai/gpt-4o',
      'meta-llama/llama-3.3-70b-instruct',
    ],
    route: 'fallback',
  },
});
```

## Cost-optimized routing

```typescript
async function cheapestCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  maxCostPerMillion = 0.5  // USD
): Promise<string> {
  // Models under the cost threshold (in order of quality)
  const cheapModels = [
    'anthropic/claude-3-5-haiku',           // ~$0.25/1M
    'openai/gpt-4o-mini',                    // $0.15/1M in
    'mistralai/mistral-7b-instruct',         // ~$0.07/1M
    'meta-llama/llama-3.3-70b-instruct:free', // free
  ];

  const response = await openrouter.chat.completions.create({
    model: cheapModels[0],
    messages,
    max_tokens: 1024,
  });

  return response.choices[0].message.content ?? '';
}
```

## Get available models list

```typescript
async function listModels(): Promise<{
  id: string;
  name: string;
  pricing: { prompt: string; completion: string };
  context_length: number;
}[]> {
  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
  });
  const data = await response.json();
  return data.data;
}

// List all free models
const models = await listModels();
const freeModels = models.filter(m => parseFloat(m.pricing.prompt) === 0);
console.log('Free models:', freeModels.map(m => m.id));
```

## Streaming with OpenRouter

```typescript
const stream = await openrouter.chat.completions.create({
  model: 'deepseek/deepseek-chat:free',
  messages: [{ role: 'user', content: 'Write a haiku about code.' }],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content ?? '';
  process.stdout.write(content);
}
```

## Check account credits and usage

```typescript
async function getCredits(): Promise<{ credits: number; usage: number }> {
  const response = await fetch('https://openrouter.ai/api/v1/credits', {
    headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
  });
  const data = await response.json();
  return { credits: data.data?.total_credits ?? 0, usage: data.data?.total_usage ?? 0 };
}

const { credits, usage } = await getCredits();
console.log(`Credits: $${credits.toFixed(4)}, Used: $${usage.toFixed(4)}, Remaining: $${(credits - usage).toFixed(4)}`);
```

## Rate limits & pricing
- No subscription required — pay per token per model
- Free tier: access to free models with daily usage limits
- Paid: pay-per-use at model-specific rates + 5-10% OpenRouter markup
- Rate limit: varies by model (usually 20-200 RPM)

## Error handling

```typescript
try {
  const response = await openrouter.chat.completions.create({ model, messages });
} catch (err: any) {
  if (err.status === 401) throw new Error('Invalid OPENROUTER_API_KEY');
  if (err.status === 402) throw new Error('OpenRouter credits exhausted — add credits at openrouter.ai');
  if (err.status === 429) throw new Error('OpenRouter rate limit — slow down or upgrade');
  if (err.status === 503) {
    const model = err.error?.metadata?.reasons?.[0];
    throw new Error(`Model unavailable: ${model} — try a fallback`);
  }
  throw err;
}
```

## Best practices
- Use free models for development and testing, paid models for production
- Always handle 503 errors — models go offline; implement fallback logic
- Include `HTTP-Referer` header to identify your app and get better rate limits
- Use `route: 'fallback'` for critical paths where uptime matters
- Check model context windows before sending long prompts — they vary widely
- The OpenRouter models page (openrouter.ai/models) always has the most current pricing
