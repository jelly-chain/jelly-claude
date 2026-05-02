# Replicate Skill — Run AI Models via API

## Overview
Replicate hosts thousands of open-source AI models — image generation (Flux, SDXL), video generation, speech, LLMs, and more — accessible via a unified prediction API. You pay per-second of compute, with no GPU setup required.

## What you need
1. **Replicate API token** — sign up at [replicate.com](https://replicate.com) → Account → API tokens
2. Store key at `~/.jelly-ai/.keys` as `REPLICATE_API_TOKEN`

## API base URL
```
https://api.replicate.com/v1
```

## Install SDK
```bash
npm install replicate
```

## Authentication
```typescript
import Replicate from 'replicate';
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });
```

## Run a model (synchronous — wait for result)

```typescript
import Replicate from 'replicate';
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

// Run Flux Schnell (fast image generation)
const output = await replicate.run(
  'black-forest-labs/flux-schnell',
  {
    input: {
      prompt: 'A photorealistic jellyfish in a neon-lit ocean, 8K, cinematic',
      num_outputs: 1,
      aspect_ratio: '1:1',
      output_format: 'webp',
      output_quality: 90,
    },
  }
) as string[];

console.log('Image URL:', output[0]);
```

## Popular models

### Flux Dev (high quality images)
```typescript
const output = await replicate.run(
  'black-forest-labs/flux-dev',
  {
    input: {
      prompt: 'A serene Japanese garden at sunset, oil painting style',
      num_outputs: 1,
      aspect_ratio: '16:9',
      guidance: 3.5,
      num_inference_steps: 28,
      output_format: 'jpeg',
    },
  }
) as string[];
```

### SDXL (Stable Diffusion XL)
```typescript
const output = await replicate.run(
  'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
  {
    input: {
      prompt: 'Astronaut riding a horse on Mars, digital art',
      negative_prompt: 'blurry, low quality, distorted',
      width: 1024,
      height: 1024,
      num_inference_steps: 30,
      guidance_scale: 7.5,
    },
  }
) as string[];
```

### Llama 3 (text generation)
```typescript
const output = await replicate.run(
  'meta/meta-llama-3-70b-instruct',
  {
    input: {
      prompt: 'Explain the theory of relativity in simple terms',
      max_new_tokens: 512,
      temperature: 0.7,
      system_prompt: 'You are a friendly science teacher.',
    },
  }
) as string[];

const text = output.join('');
console.log(text);
```

### Whisper transcription
```typescript
const output = await replicate.run(
  'openai/whisper:4d50797290df275329f202e48c76360b3f22b08d28c196cbc54600319435f8d2',
  {
    input: {
      audio: 'https://example.com/audio.mp3',
      model: 'large-v3',
      translate: false,
      language: 'en',
    },
  }
) as { transcription: string; segments: any[] };

console.log(output.transcription);
```

## Asynchronous prediction (long-running jobs)

```typescript
import Replicate from 'replicate';
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

// Create prediction
const prediction = await replicate.predictions.create({
  model: 'black-forest-labs/flux-dev',
  input: {
    prompt: 'A galaxy with spiral arms, ultra-detailed, NASA photography style',
    num_outputs: 4,
    aspect_ratio: '1:1',
  },
});

console.log('Prediction ID:', prediction.id);
console.log('Status:', prediction.status);

// Poll for completion
const completed = await replicate.wait(prediction, {
  interval: 1000,  // poll every 1 second
});

console.log('Status:', completed.status);  // 'succeeded' | 'failed' | 'canceled'
if (completed.status === 'succeeded') {
  const urls = completed.output as string[];
  console.log('Images:', urls);
}
```

## Cancel a prediction

```typescript
const prediction = await replicate.predictions.create({
  model: 'black-forest-labs/flux-dev',
  input: { prompt: '...' },
});

// Cancel if taking too long
await new Promise(r => setTimeout(r, 5000));
if (prediction.status === 'processing') {
  const canceled = await replicate.predictions.cancel(prediction.id);
  console.log('Canceled:', canceled.status);
}
```

## List your predictions (history)

```typescript
const predictions = await replicate.predictions.list();
for (const p of predictions.results) {
  console.log(p.id, p.model, p.status, p.created_at);
}
```

## Fine-tuned models (your own versions)

```typescript
// Run a specific version of a model
const output = await replicate.predictions.create({
  version: 'your-model-version-sha256-here',
  input: {
    prompt: 'A portrait of TOK in a forest',
    num_inference_steps: 28,
  },
});

const result = await replicate.wait(output);
```

## Download output to file

```typescript
import fs from 'fs';
import https from 'https';

async function downloadOutput(url: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(url, res => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

const output = await replicate.run('black-forest-labs/flux-schnell', {
  input: { prompt: 'A sunset over mountains', num_outputs: 1 },
}) as string[];

await downloadOutput(output[0], './generated-image.webp');
console.log('Saved to ./generated-image.webp');
```

## Batch image generation

```typescript
async function batchGenerate(prompts: string[], model = 'black-forest-labs/flux-schnell'): Promise<string[]> {
  const predictions = await Promise.all(
    prompts.map(prompt =>
      replicate.predictions.create({
        model,
        input: { prompt, num_outputs: 1 },
      })
    )
  );

  const completed = await Promise.all(
    predictions.map(p => replicate.wait(p))
  );

  return completed
    .filter(p => p.status === 'succeeded')
    .flatMap(p => p.output as string[]);
}

const images = await batchGenerate([
  'A cat wearing sunglasses',
  'A robot in a garden',
  'A mountain at dawn',
]);
```

## Rate limits & pricing
- **No monthly subscription** — pay per prediction
- Flux Schnell: ~$0.003/image (fast)
- Flux Dev: ~$0.055/image (quality)
- SDXL: ~$0.035/image
- Llama 3 70B: ~$0.65/1M tokens
- Rate limit: 50 concurrent predictions (paid), 5 (free)

## Error handling

```typescript
try {
  const output = await replicate.run(model, { input });
} catch (err: any) {
  if (err.response?.status === 401) throw new Error('Invalid REPLICATE_API_TOKEN');
  if (err.response?.status === 429) throw new Error('Replicate rate limit — reduce concurrency');
  if (err.response?.status === 422) throw new Error('Invalid model input: ' + JSON.stringify(err.response?.data?.detail));
  throw err;
}
```

## Best practices
- Use `replicate.run()` for quick jobs, `predictions.create()` + `replicate.wait()` for long jobs
- For image generation, Flux Schnell is the fastest and cheapest; Flux Dev for quality
- Always save output URLs immediately — they expire after 24 hours
- Use the prediction ID to monitor status from multiple processes
- Check model pages at replicate.com for exact input schemas — they differ per model version
