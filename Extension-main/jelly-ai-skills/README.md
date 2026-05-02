# Jelly-AI Skills

> 6 skills for the Jelly-AI agent — OpenAI, Groq, Replicate, ElevenLabs, Stability AI, and OpenRouter.

**GitHub:** [github.com/jelly-chain/Extension/jelly-ai-skills](https://github.com/jelly-chain/Extension/jelly-ai-skills)

---

## Install everything at once

```bash
bash install-all.sh       # Mac / Linux
.\install-all.ps1         # Windows PowerShell
```

## Install a single skill

```bash
bash skills/openai-skill/install.sh
```

---

## Skill list (6 skills)

| Skill | API | Description |
|-------|-----|-------------|
| `openai-skill` | OpenAI | Chat, streaming, vision, function calling, embeddings, DALL-E 3 |
| `groq-skill` | Groq | Ultra-fast LLM inference at 800+ t/s — Llama, Mixtral, Whisper |
| `replicate-skill` | Replicate | 1000+ AI models via prediction API — Flux, SDXL, Llama |
| `elevenlabs-skill` | ElevenLabs | TTS, voice cloning (IVC/PVC), speech-to-speech |
| `stability-skill` | Stability AI | SD3 generation, editing (remove-bg, inpaint), upscaling |
| `openrouter-skill` | OpenRouter | 200+ models unified API — free and paid tiers |

---

## Keys

All keys go in `~/.jelly-ai/.keys`. Example:
```
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
REPLICATE_API_TOKEN=r8_...
ELEVENLABS_API_KEY=...
STABILITY_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...
```

You don't need all 6 — install the skills you have keys for.

---

## License

MIT
