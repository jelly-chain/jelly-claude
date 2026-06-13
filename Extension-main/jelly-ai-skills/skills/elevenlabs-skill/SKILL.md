# ElevenLabs Skill — Text-to-Speech & Voice Cloning

## Overview
ElevenLabs provides state-of-the-art AI voice synthesis — text-to-speech, voice cloning from audio samples, multilingual synthesis, audio narration, and real-time streaming. It's the industry leader for realistic, expressive AI voices.

## What you need
1. **ElevenLabs API key** — sign up at [elevenlabs.io](https://elevenlabs.io) → Profile → API Key
2. Store key at `~/.jelly-ai/.keys` as `ELEVENLABS_API_KEY`

## API base URL
```
https://api.elevenlabs.io/v1
```

## Install SDK
```bash
npm install elevenlabs
```

## Authentication
```typescript
import { ElevenLabsClient } from 'elevenlabs';
const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! });
```

## Text-to-speech (basic)

```typescript
import { ElevenLabsClient } from 'elevenlabs';
import fs from 'fs';

const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! });

// Generate audio from text
const audioStream = await elevenlabs.textToSpeech.convert(
  'JBFqnCBsd6RMkjVDRZzb',  // voice ID (George — premade English voice)
  {
    text: 'Hello! Welcome to the Jelly-AI agent. How can I help you today?',
    model_id: 'eleven_multilingual_v2',  // or 'eleven_turbo_v2_5' for fastest
    voice_settings: {
      stability: 0.5,       // 0-1: lower = more expressive
      similarity_boost: 0.8, // 0-1: how closely to match the voice
      style: 0.2,            // 0-1: style exaggeration
      use_speaker_boost: true,
    },
  }
);

// Save to file
const chunks: Buffer[] = [];
for await (const chunk of audioStream) {
  chunks.push(chunk);
}
fs.writeFileSync('./output.mp3', Buffer.concat(chunks));
console.log('Saved to output.mp3');
```

## Models
| Model | Speed | Quality | Languages |
|-------|-------|---------|-----------|
| `eleven_turbo_v2_5` | Fastest | Good | 32 |
| `eleven_multilingual_v2` | Medium | Best | 29 |
| `eleven_monolingual_v1` | Fast | Good | English only |
| `eleven_flash_v2_5` | Ultra-fast | Moderate | 32 |

## List available voices

```typescript
const voices = await elevenlabs.voices.getAll();

voices.voices.forEach(v => {
  console.log(`${v.voice_id} — ${v.name} (${v.category}) — ${v.labels?.accent ?? ''}`);
});

// Find a voice by name
const rachel = voices.voices.find(v => v.name === 'Rachel');
console.log('Rachel voice ID:', rachel?.voice_id);
```

## Popular premade voice IDs
```typescript
const VOICES = {
  rachel: '21m00Tcm4TlvDq8ikWAM',
  dave:   'CYw3kZ02Hs0563khs1Fj',
  adam:   'pNInz6obpgDQGcFmaJgB',
  bella:  'EXAVITQu4vr4xnSDxMaL',
  george: 'JBFqnCBsd6RMkjVDRZzb',
  callum: 'N2lVS1w4EtoT3dr4eOWO',
};
```

## Voice cloning — create a custom voice

```typescript
import fs from 'fs';
import { ElevenLabsClient } from 'elevenlabs';

const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! });

// Instant Voice Cloning (IVC) — requires 1-30 minutes of clean audio
async function cloneVoice(
  name: string,
  description: string,
  audioFilePaths: string[]
): Promise<string> {
  const files = audioFilePaths.map(p => fs.createReadStream(p));

  const voice = await elevenlabs.voices.ivc.create({
    name,
    description,
    files,
    remove_background_noise: true,
  });

  console.log('Cloned voice ID:', voice.voice_id);
  return voice.voice_id;
}

// Usage
const voiceId = await cloneVoice(
  'My Custom Voice',
  'A warm, professional American English voice',
  ['./sample1.mp3', './sample2.mp3']
);
```

## Professional Voice Cloning (PVC) — highest quality

```typescript
// PVC requires a minimum of 30 minutes of audio
// First create the voice, then add samples and train it
const voice = await elevenlabs.voices.pvcCreate({
  name: 'Brand Voice',
  description: 'Official brand spokesperson voice',
});

// Add audio samples
await elevenlabs.voices.pvcAddSamples(voice.voice_id, {
  files: [fs.createReadStream('./long-sample.mp3')],
});

// Start training (takes ~15-30 minutes)
await elevenlabs.voices.pvcStartTraining(voice.voice_id);
console.log('Training started for voice:', voice.voice_id);
```

## Streaming text-to-speech (real-time)

```typescript
import { ElevenLabsClient } from 'elevenlabs';
import { Readable } from 'stream';

const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! });

async function streamToSpeaker(text: string, voiceId: string): Promise<void> {
  const stream = await elevenlabs.textToSpeech.convertAsStream(voiceId, {
    text,
    model_id: 'eleven_turbo_v2_5',
    output_format: 'pcm_24000',  // raw PCM for lowest latency playback
  });

  for await (const chunk of stream) {
    // In a real app, write to an audio output stream / speaker
    process.stdout.write(`[chunk: ${chunk.length} bytes]\n`);
  }
}
```

## Batch text-to-speech with timestamps

```typescript
interface SpeechOptions {
  voiceId: string;
  model?: string;
  outputDir?: string;
}

async function batchTTS(
  items: Array<{ id: string; text: string }>,
  options: SpeechOptions
): Promise<Map<string, string>> {
  const { voiceId, model = 'eleven_turbo_v2_5', outputDir = '.' } = options;
  const outputPaths = new Map<string, string>();

  for (const item of items) {
    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text: item.text,
      model_id: model,
    });

    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) chunks.push(chunk);

    const filePath = `${outputDir}/${item.id}.mp3`;
    fs.writeFileSync(filePath, Buffer.concat(chunks));
    outputPaths.set(item.id, filePath);
    console.log(`Generated: ${filePath}`);
  }

  return outputPaths;
}
```

## Speech-to-speech (voice conversion)

```typescript
// Convert one voice to another while preserving rhythm and emotion
const outputAudio = await elevenlabs.speechToSpeech.convert(
  'JBFqnCBsd6RMkjVDRZzb',  // target voice ID
  {
    audio: fs.createReadStream('./input-speech.mp3'),
    model_id: 'eleven_english_sts_v2',
    voice_settings: { stability: 0.5, similarity_boost: 0.8 },
  }
);

const chunks: Buffer[] = [];
for await (const chunk of outputAudio) chunks.push(chunk);
fs.writeFileSync('./converted-speech.mp3', Buffer.concat(chunks));
```

## Sound effects generation

```typescript
const sfx = await elevenlabs.textToSoundEffects.convert({
  text: 'A roaring thunderstorm with heavy rain and occasional lightning',
  duration_seconds: 5,
  prompt_influence: 0.3,
});

const chunks: Buffer[] = [];
for await (const chunk of sfx) chunks.push(chunk);
fs.writeFileSync('./thunder.mp3', Buffer.concat(chunks));
```

## Check usage and credits

```typescript
const user = await elevenlabs.user.get();
console.log('Character limit:', user.subscription.character_limit);
console.log('Characters used:', user.subscription.character_count);
console.log('Remaining:', user.subscription.character_limit - user.subscription.character_count);
```

## Rate limits & pricing
- **Free:** 10,000 chars/month, 3 custom voices
- **Starter ($5/month):** 30,000 chars, 10 voices, commercial use
- **Creator ($22/month):** 100,000 chars, 30 voices, PVC
- **Pro ($99/month):** 500,000 chars, 160 voices, PVC, priority queue
- Overage: ~$0.30/1,000 chars

## Error handling

```typescript
try {
  const audio = await elevenlabs.textToSpeech.convert(voiceId, { text, model_id });
} catch (err: any) {
  if (err.statusCode === 401) throw new Error('Invalid ELEVENLABS_API_KEY');
  if (err.statusCode === 422) throw new Error('Invalid voice ID or input');
  if (err.statusCode === 429) throw new Error('ElevenLabs rate limit — slow down');
  if (err.detail?.status === 'quota_exceeded') throw new Error('ElevenLabs character quota exhausted');
  throw err;
}
```

## Best practices
- Use `eleven_turbo_v2_5` for latency-sensitive apps, `eleven_multilingual_v2` for quality
- For voice cloning, use clean audio with no background noise, multiple short clips (30s-2min each)
- Keep `stability` at 0.5 and `similarity_boost` at 0.75 as a starting point — tune from there
- Stream audio output for real-time applications to reduce time-to-first-audio
- Track character usage — overage can get expensive fast
- For IVC, 5-10 minutes of clear audio is sufficient for good quality
