# Groq Skill — Ultra-Fast LLM Inference

## Overview
Groq runs LLMs on custom LPU (Language Processing Unit) hardware that delivers inference at 800+ tokens/second — 10-20x faster than GPU-based providers. It's ideal for real-time applications, bulk processing, and latency-sensitive pipelines. Groq is OpenAI-API-compatible.

## What you need
1. **Groq API key** — sign up at [console.groq.com](https://console.groq.com) → API Keys
2. Store key at `~/.jelly-ai/.keys` as `GROQ_API_KEY`

## API base URL
```
https://api.groq.com/openai/v1
```

## Install SDK
```bash
npm install groq-sdk
```

## Available models
| Model | Context | Best for | Speed |
|-------|---------|----------|-------|
| `llama-3.3-70b-versatile` | 128k | High quality, complex tasks | ~800 t/s |
| `llama-3.1-8b-instant` | 128k | Maximum speed, simple tasks | ~1200 t/s |
| `mixtral-8x7b-32768` | 32k | Mixed-expert, reasoning | ~600 t/s |
| `gemma2-9b-it` | 8k | Lightweight, fast | ~900 t/s |
| `llama-3.2-90b-vision-preview` | 128k | Vision + text | ~600 t/s |
| `whisper-large-v3` | audio | Transcription | fast |

## Basic chat completion

```typescript
import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

const response = await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [
    { role: 'system', content: 'You are a helpful assistant. Be concise.' },
    { role: 'user', content: 'What are the main differences between TypeScript and JavaScript?' },
  ],
  temperature: 0.7,
  max_tokens: 1024,
});

console.log(response.choices[0].message.content);
// Groq reports actual tokens/sec:
console.log('Speed:', response.usage?.completion_tokens, 'tokens in', response.usage?.completion_time, 's');
```

## OpenAI-compatible (drop-in replacement)

```typescript
// Groq is fully compatible with the OpenAI SDK — just change baseURL
import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: 'https://api.groq.com/openai/v1',
});

const response = await groq.chat.completions.create({
  model: 'llama-3.1-8b-instant',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

## Streaming for real-time output

```typescript
import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

const stream = await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [{ role: 'user', content: 'Write a detailed summary of the French Revolution.' }],
  stream: true,
});

let totalTokens = 0;
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content ?? '';
  process.stdout.write(content);
  if (chunk.x_groq?.usage?.completion_tokens) {
    totalTokens = chunk.x_groq.usage.completion_tokens;
  }
}
console.log(`\n[${totalTokens} tokens]`);
```

## Bulk text processing pipeline

```typescript
// Process many documents in parallel — Groq handles high concurrency
async function bulkProcess(documents: string[], instruction: string): Promise<string[]> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

  const results = await Promise.all(
    documents.map(doc =>
      groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',  // fastest model for bulk
        messages: [
          { role: 'system', content: instruction },
          { role: 'user', content: doc },
        ],
        max_tokens: 256,
        temperature: 0,  // deterministic for processing tasks
      }).then(r => r.choices[0].message.content ?? '')
    )
  );

  return results;
}

// Usage: summarise 100 articles at once
const summaries = await bulkProcess(articles, 'Summarise this article in 2 sentences.');
```

## Summarisation at scale

```typescript
interface SummaryOptions {
  style: 'bullet' | 'paragraph' | 'executive';
  maxWords?: number;
  language?: string;
}

async function summarise(text: string, options: SummaryOptions = { style: 'bullet' }): Promise<string> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

  const stylePrompts = {
    bullet: 'Summarise in 5-7 bullet points. Each bullet one sentence.',
    paragraph: `Summarise in 1 clear paragraph (max ${options.maxWords ?? 150} words).`,
    executive: 'Write an executive summary: 1 headline sentence, 3-5 key takeaways, 1 recommendation.',
  };

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: stylePrompts[options.style] },
      { role: 'user', content: text },
    ],
    temperature: 0.3,
    max_tokens: 512,
  });

  return response.choices[0].message.content ?? '';
}

// Summarise a long document
const summary = await summarise(longArticleText, { style: 'executive' });
```

## Multi-turn conversation (ultra-fast chat)

```typescript
import Groq from 'groq-sdk';
import * as readline from 'readline';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const messages: Groq.Chat.ChatCompletionMessageParam[] = [
  { role: 'system', content: 'You are a concise assistant. Answers in 2-3 sentences max.' },
];

const chat = async () => {
  rl.question('You: ', async input => {
    messages.push({ role: 'user', content: input });

    const res = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',  // instant model for sub-100ms chat
      messages,
      max_tokens: 256,
    });

    const reply = res.choices[0].message.content ?? '';
    messages.push({ role: 'assistant', content: reply });
    console.log('AI:', reply);
    chat();
  });
};

chat();
```

## Audio transcription (Whisper)

```typescript
import fs from 'fs';

const transcription = await groq.audio.transcriptions.create({
  file: fs.createReadStream('./audio.mp3'),
  model: 'whisper-large-v3',
  response_format: 'verbose_json',
  language: 'en',
  timestamp_granularities: ['segment'],
});

console.log(transcription.text);
transcription.segments?.forEach(s => {
  console.log(`[${s.start.toFixed(1)}s - ${s.end.toFixed(1)}s] ${s.text}`);
});
```

## Vision (Llama vision preview)

```typescript
import fs from 'fs';

const imageBase64 = fs.readFileSync('./image.jpg').toString('base64');

const response = await groq.chat.completions.create({
  model: 'llama-3.2-90b-vision-preview',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'What is in this image? Describe in detail.' },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
      ],
    },
  ],
  max_tokens: 1024,
});

console.log(response.choices[0].message.content);
```

## JSON output mode

```typescript
const response = await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [
    { role: 'system', content: 'Respond only with valid JSON. No prose.' },
    { role: 'user', content: 'Extract name, email, and company from: "Hi, I\'m Jane Smith, jane@acme.com, VP at Acme Corp."' },
  ],
  response_format: { type: 'json_object' },
  temperature: 0,
});

const data = JSON.parse(response.choices[0].message.content!);
console.log(data); // { name: 'Jane Smith', email: 'jane@acme.com', company: 'Acme Corp' }
```

## Rate limits & pricing
- **Free tier:** 6,000 req/day (Llama 8B), 14,400 req/day (Llama 70B), generous token limits
- **Paid:** $0.05/1M tokens (8B), $0.59/1M tokens (70B)
- **Whisper:** $0.111/hour of audio
- Rate limit: 30 RPM on free, 600 RPM on paid

## Error handling

```typescript
import Groq from 'groq-sdk';

try {
  const response = await groq.chat.completions.create({ model, messages });
} catch (err: any) {
  if (err.status === 401) throw new Error('Invalid GROQ_API_KEY');
  if (err.status === 429) {
    const retryAfter = err.headers?.['retry-after'] ?? 60;
    throw new Error(`Groq rate limit — retry after ${retryAfter}s`);
  }
  if (err.status === 503) throw new Error('Groq overloaded — retry in 10s');
  throw err;
}
```

## Best practices
- Use `llama-3.1-8b-instant` for high-throughput bulk jobs — it's 3x cheaper and nearly as fast
- Use `llama-3.3-70b-versatile` for quality-sensitive tasks
- Groq free tier is generous — it's the best choice for prototyping and testing
- Groq's OpenAI compatibility means you can swap providers with one env var change
- For streaming, use the `x_groq.usage` field on the final chunk for token counts
- Batch parallel calls rather than serial — Groq handles concurrent requests well
