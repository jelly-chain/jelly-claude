# OpenAI Skill — Chat, Completions, Vision, Embeddings & Function Calling

## Overview
OpenAI provides the most widely-used LLM APIs: GPT-4o, o1, o3-mini for chat; DALL-E 3 for images; Whisper for transcription; and text-embedding-3 for semantic search. It's the reference standard for structured output, function calling, and vision.

## What you need
1. **OpenAI API key** — sign up at [platform.openai.com](https://platform.openai.com) → API keys
2. Store key at `~/.jelly-ai/.keys` as `OPENAI_API_KEY`

## API base URL
```
https://api.openai.com/v1
```

## Install SDK
```bash
npm install openai
```

## Authentication
```typescript
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
```

## Models quick reference
| Model | Best for | Context | Cost |
|-------|----------|---------|------|
| `gpt-4o` | Flagship, vision, coding | 128k | $2.50/1M in |
| `gpt-4o-mini` | Fast, cheap, everyday tasks | 128k | $0.15/1M in |
| `o3-mini` | Reasoning-heavy tasks | 200k | $1.10/1M in |
| `gpt-4-turbo` | Long docs, legacy | 128k | $10/1M in |

## Basic chat completion

```typescript
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain quantum entanglement in 3 sentences.' },
  ],
  temperature: 0.7,
  max_tokens: 500,
});

console.log(response.choices[0].message.content);
console.log('Tokens used:', response.usage?.total_tokens);
```

## Streaming response

```typescript
const stream = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Write a 500-word essay on climate change.' }],
  stream: true,
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content;
  if (delta) process.stdout.write(delta);
}
console.log('\n--- done ---');
```

## Structured output (JSON mode)

```typescript
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

const ProductSchema = z.object({
  name: z.string(),
  price: z.number(),
  category: z.string(),
  inStock: z.boolean(),
  description: z.string().max(200),
});

const result = await openai.beta.chat.completions.parse({
  model: 'gpt-4o-2024-08-06',
  messages: [
    { role: 'system', content: 'Extract product information from the text.' },
    { role: 'user', content: 'MacBook Pro 16-inch with M3 Max chip, $3,499, available now in the laptop category.' },
  ],
  response_format: zodResponseFormat(ProductSchema, 'product'),
});

const product = result.choices[0].message.parsed!;
console.log(product.name, product.price);
```

## Function calling / tools

```typescript
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get current weather for a location',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'City, Country' },
          unit:     { type: 'string', enum: ['celsius', 'fahrenheit'] },
        },
        required: ['location'],
      },
    },
  },
];

const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  { role: 'user', content: 'What is the weather in Tokyo?' },
];

const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages,
  tools,
  tool_choice: 'auto',
});

const toolCall = response.choices[0].message.tool_calls?.[0];
if (toolCall) {
  const args = JSON.parse(toolCall.function.arguments);
  console.log('Calling:', toolCall.function.name, args);

  // Execute your actual function here:
  // const result = await getWeather(args.location, args.unit);

  // Send the result back
  messages.push(response.choices[0].message);
  messages.push({
    role: 'tool',
    tool_call_id: toolCall.id,
    content: JSON.stringify({ temperature: 22, condition: 'Sunny', humidity: '60%' }),
  });

  const final = await openai.chat.completions.create({ model: 'gpt-4o', messages });
  console.log(final.choices[0].message.content);
}
```

## Vision — image understanding

```typescript
// Analyse a remote image URL
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Describe what you see in this image in detail.' },
        { type: 'image_url', image_url: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Culinary_fruits_front_view.jpg/1200px-Culinary_fruits_front_view.jpg' } },
      ],
    },
  ],
  max_tokens: 500,
});
console.log(response.choices[0].message.content);

// Analyse a local file (base64)
import fs from 'fs';
const imageData = fs.readFileSync('./screenshot.png').toString('base64');

const localResponse = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'What does this UI screenshot show? List any bugs or improvements.' },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${imageData}` } },
      ],
    },
  ],
});
```

## Embeddings (semantic search)

```typescript
// Generate embeddings for a list of texts
async function embed(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',  // or 'text-embedding-3-large' for higher quality
    input: texts,
    encoding_format: 'float',
  });
  return response.data.map(d => d.embedding);
}

// Cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (magA * magB);
}

// Simple semantic search
async function semanticSearch(query: string, documents: string[]): Promise<{ doc: string; score: number }[]> {
  const [queryEmbedding, ...docEmbeddings] = await embed([query, ...documents]);
  return documents
    .map((doc, i) => ({ doc, score: cosineSimilarity(queryEmbedding, docEmbeddings[i]) }))
    .sort((a, b) => b.score - a.score);
}
```

## Audio transcription (Whisper)

```typescript
import fs from 'fs';

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream('./meeting.mp3'),
  model: 'whisper-1',
  language: 'en',              // optional: auto-detect if omitted
  response_format: 'verbose_json',  // includes timestamps
});

console.log(transcription.text);
// With verbose_json:
// transcription.segments.forEach(s => console.log(s.start, s.end, s.text));
```

## DALL-E 3 image generation

```typescript
const image = await openai.images.generate({
  model: 'dall-e-3',
  prompt: 'A photorealistic jellyfish floating in a neon-lit ocean, cinematic lighting',
  size: '1024x1024',    // '1792x1024' | '1024x1792' for wide/tall
  quality: 'hd',        // 'standard' | 'hd'
  n: 1,
});

console.log('Image URL:', image.data[0].url);
// Download and save:
const imageUrl = image.data[0].url!;
const res = await fetch(imageUrl);
const buffer = await res.arrayBuffer();
fs.writeFileSync('./output.png', Buffer.from(buffer));
```

## Rate limits & pricing
- `gpt-4o-mini`: $0.15/1M input tokens, $0.60/1M output — best cost/quality
- `gpt-4o`: $2.50/1M input, $10/1M output
- `text-embedding-3-small`: $0.02/1M tokens
- `whisper-1`: $0.006/minute
- `dall-e-3`: $0.040/image (standard), $0.080/image (HD)
- Rate limit: 10,000 RPM on Tier 1, scales with usage

## Error handling

```typescript
import { OpenAI, APIError } from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

try {
  const response = await openai.chat.completions.create({ model: 'gpt-4o', messages });
} catch (err) {
  if (err instanceof APIError) {
    if (err.status === 401) throw new Error('Invalid OPENAI_API_KEY');
    if (err.status === 429) throw new Error('OpenAI rate limit or quota exceeded');
    if (err.status === 503) throw new Error('OpenAI API overloaded — retry in 30s');
    throw new Error(`OpenAI API error ${err.status}: ${err.message}`);
  }
  throw err;
}
```

## Best practices
- Use `gpt-4o-mini` for bulk tasks, `gpt-4o` for complex reasoning
- Use structured output (`zodResponseFormat`) instead of regex-parsing JSON
- Stream long responses to reduce perceived latency
- Set `max_tokens` to prevent runaway responses
- Cache embeddings locally — they don't change for the same text
- For function calling, keep schemas simple and well-described
