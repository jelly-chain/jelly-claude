# Stability AI Skill — Image Generation, Editing & Upscaling

## Overview
Stability AI provides the Stable Image API — image generation (Stable Diffusion 3.5, SDXL), image editing (inpainting, outpainting, search-and-replace, remove background), style transfer, and upscaling. All via a REST API with no model hosting required.

## What you need
1. **Stability AI API key** — sign up at [platform.stability.ai](https://platform.stability.ai) → API Keys
2. Store key at `~/.jelly-ai/.keys` as `STABILITY_API_KEY`

## API base URL
```
https://api.stability.ai/v2beta
```

## Authentication
```typescript
import axios from 'axios';
import FormData from 'form-data';

const stabilityClient = axios.create({
  baseURL: 'https://api.stability.ai/v2beta',
  headers: {
    Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
    Accept: 'image/*',
  },
});
```

## Models
| API endpoint | Model | Best for |
|-------------|-------|----------|
| `/stable-image/generate/sd3` | SD 3.5 Large | Highest quality, photorealistic |
| `/stable-image/generate/sd3` (medium) | SD 3.5 Medium | Fast, good quality |
| `/stable-image/generate/core` | SDXL Core | Fast, everyday generation |
| `/stable-image/generate/ultra` | SDXL Ultra | Difficult prompts, complex scenes |

## Text-to-image generation

```typescript
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function generateImage(
  prompt: string,
  options: {
    negativePrompt?: string;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '21:9' | '3:2' | '2:3' | '4:5' | '5:4';
    outputFormat?: 'png' | 'jpeg' | 'webp';
    model?: 'sd3-large' | 'sd3-medium' | 'sd3-large-turbo';
    outputPath?: string;
  } = {}
): Promise<Buffer> {
  const { negativePrompt, aspectRatio = '1:1', outputFormat = 'png', model = 'sd3-large', outputPath } = options;

  const form = new FormData();
  form.append('prompt', prompt);
  if (negativePrompt) form.append('negative_prompt', negativePrompt);
  form.append('aspect_ratio', aspectRatio);
  form.append('output_format', outputFormat);
  form.append('model', model);

  const response = await axios.post('/stable-image/generate/sd3', form, {
    baseURL: 'https://api.stability.ai/v2beta',
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      Accept: 'image/*',
    },
    responseType: 'arraybuffer',
  });

  const imageBuffer = Buffer.from(response.data);
  if (outputPath) {
    fs.writeFileSync(outputPath, imageBuffer);
    console.log('Saved to:', outputPath);
  }
  return imageBuffer;
}

// Usage
await generateImage(
  'A photorealistic golden jellyfish floating in a dark ocean, bioluminescent, cinematic lighting',
  { aspectRatio: '16:9', outputFormat: 'png', outputPath: './jellyfish.png' }
);
```

## Core (fast generation)

```typescript
async function generateCore(prompt: string, outputPath: string): Promise<void> {
  const form = new FormData();
  form.append('prompt', prompt);
  form.append('aspect_ratio', '1:1');
  form.append('output_format', 'webp');

  const response = await axios.post('/stable-image/generate/core', form, {
    baseURL: 'https://api.stability.ai/v2beta',
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      Accept: 'image/*',
    },
    responseType: 'arraybuffer',
  });

  fs.writeFileSync(outputPath, Buffer.from(response.data));
}
```

## Image-to-image (style transfer / img2img)

```typescript
async function imageToImage(
  imagePath: string,
  prompt: string,
  strength: number = 0.7  // 0 = preserve original, 1 = ignore original
): Promise<Buffer> {
  const form = new FormData();
  form.append('image', fs.createReadStream(imagePath));
  form.append('prompt', prompt);
  form.append('strength', strength.toString());
  form.append('output_format', 'png');

  const response = await axios.post('/stable-image/generate/sd3', form, {
    baseURL: 'https://api.stability.ai/v2beta',
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      Accept: 'image/*',
    },
    responseType: 'arraybuffer',
  });

  return Buffer.from(response.data);
}
```

## Remove background

```typescript
async function removeBackground(imagePath: string, outputPath: string): Promise<void> {
  const form = new FormData();
  form.append('image', fs.createReadStream(imagePath));
  form.append('output_format', 'png');

  const response = await axios.post('/stable-image/edit/remove-background', form, {
    baseURL: 'https://api.stability.ai/v2beta',
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      Accept: 'image/*',
    },
    responseType: 'arraybuffer',
  });

  fs.writeFileSync(outputPath, Buffer.from(response.data));
  console.log('Background removed and saved to', outputPath);
}
```

## Search and replace (inpainting)

```typescript
async function searchAndReplace(
  imagePath: string,
  searchPrompt: string,
  replacePrompt: string,
  outputPath: string
): Promise<void> {
  const form = new FormData();
  form.append('image', fs.createReadStream(imagePath));
  form.append('search_prompt', searchPrompt);   // what to find in the image
  form.append('prompt', replacePrompt);          // what to replace it with
  form.append('output_format', 'png');

  const response = await axios.post('/stable-image/edit/search-and-replace', form, {
    baseURL: 'https://api.stability.ai/v2beta',
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      Accept: 'image/*',
    },
    responseType: 'arraybuffer',
  });

  fs.writeFileSync(outputPath, Buffer.from(response.data));
}

// Example: replace the sky in a photo
await searchAndReplace('./photo.jpg', 'blue sky', 'dramatic sunset sky with orange clouds', './edited.png');
```

## Outpainting (expand image canvas)

```typescript
async function outpaint(
  imagePath: string,
  expansion: { left?: number; right?: number; up?: number; down?: number },
  prompt: string,
  outputPath: string
): Promise<void> {
  const form = new FormData();
  form.append('image', fs.createReadStream(imagePath));
  if (expansion.left)  form.append('left', expansion.left.toString());
  if (expansion.right) form.append('right', expansion.right.toString());
  if (expansion.up)    form.append('up', expansion.up.toString());
  if (expansion.down)  form.append('down', expansion.down.toString());
  form.append('prompt', prompt);
  form.append('output_format', 'png');

  const response = await axios.post('/stable-image/edit/outpaint', form, {
    baseURL: 'https://api.stability.ai/v2beta',
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      Accept: 'image/*',
    },
    responseType: 'arraybuffer',
  });

  fs.writeFileSync(outputPath, Buffer.from(response.data));
}
```

## Upscaling

```typescript
async function upscale(
  imagePath: string,
  outputPath: string,
  prompt?: string  // optional context for better upscaling
): Promise<void> {
  const form = new FormData();
  form.append('image', fs.createReadStream(imagePath));
  if (prompt) form.append('prompt', prompt);
  form.append('output_format', 'png');

  const response = await axios.post('/stable-image/upscale/conservative', form, {
    baseURL: 'https://api.stability.ai/v2beta',
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      Accept: 'image/*',
    },
    responseType: 'arraybuffer',
  });

  fs.writeFileSync(outputPath, Buffer.from(response.data));
  console.log('Upscaled and saved to', outputPath);
}
```

## Sketch to image

```typescript
async function sketchToImage(sketchPath: string, prompt: string, outputPath: string): Promise<void> {
  const form = new FormData();
  form.append('image', fs.createReadStream(sketchPath));
  form.append('prompt', prompt);
  form.append('output_format', 'png');
  form.append('control_strength', '0.7');  // how closely to follow the sketch

  const response = await axios.post('/stable-image/control/sketch', form, {
    baseURL: 'https://api.stability.ai/v2beta',
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      Accept: 'image/*',
    },
    responseType: 'arraybuffer',
  });

  fs.writeFileSync(outputPath, Buffer.from(response.data));
}
```

## Rate limits & pricing
- **SD3 Large:** $0.065/image
- **SD3 Medium:** $0.035/image
- **Core:** $0.03/image
- **Ultra:** $0.08/image
- **Remove background:** $0.02/image
- **Upscale:** $0.25/image
- **Search & replace:** $0.04/image
- Free trial credits available on sign-up

## Error handling

```typescript
try {
  const image = await generateImage(prompt, options);
} catch (err: any) {
  if (err.response?.status === 401) throw new Error('Invalid STABILITY_API_KEY');
  if (err.response?.status === 402) throw new Error('Stability AI credits exhausted — add credits at platform.stability.ai');
  if (err.response?.status === 422) {
    const detail = err.response?.data?.errors ?? err.response?.data;
    throw new Error(`Invalid request: ${JSON.stringify(detail)}`);
  }
  if (err.response?.status === 429) throw new Error('Stability AI rate limit — wait before retrying');
  throw err;
}
```

## Best practices
- SD3 Large produces the best quality; use Core for speed/cost
- Always include `negative_prompt` to avoid common artifacts: "blurry, low quality, distorted, bad anatomy"
- For image editing, the source image must be at least 64×64 and under 10MB
- Use `output_format: 'webp'` for smaller file sizes (same quality as PNG for photos)
- Remove background works best on subjects with clear edges
- For outpainting, keep expansion sizes reasonable (max 2x original dimensions)
