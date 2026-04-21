# Jelly-AI

> Multi-model AI agent powered by Claude Code — OpenAI, Groq, Replicate, ElevenLabs, Stability AI, and OpenRouter.

**GitHub:** [github.com/jelly-chain/jelly-ai](https://github.com/jelly-chain/jelly-ai)

---

## What is this?

Jelly-AI is a launch wrapper for [Claude Code](https://github.com/anthropics/claude-code) that:
- Installs **6 skills** covering every major AI model API
- Loads **6 agent templates** for code generation, summarisation, image creation, voice cloning, image editing, and model routing
- Includes `CLAUDE.md` — session memory that pre-loads all skill paths so Claude starts every session already oriented
- Works with Anthropic paid models or free/cheap OpenRouter models

---

## Prerequisites

| Tool | Version | Get it |
|------|---------|--------|
| Node.js | v18+ | [nodejs.org](https://nodejs.org) |
| npm | v9+ | Comes with Node |
| Git | any | [git-scm.com](https://git-scm.com) |

---

## Quick Start

### Mac / Linux

```bash
git clone https://github.com/jelly-chain/jelly-ai
git clone https://github.com/jelly-chain/jelly-ai-skills
git clone https://github.com/jelly-chain/jelly-ai-agents

cd jelly-ai
bash setup.sh
bash jelly-ai.sh
```

### Windows (PowerShell)

```powershell
git clone https://github.com/jelly-chain/jelly-ai
git clone https://github.com/jelly-chain/jelly-ai-skills
git clone https://github.com/jelly-chain/jelly-ai-agents

cd jelly-ai
.\setup.ps1
.\jelly-ai.ps1
```

---

## Claude API Key

```
ANTHROPIC_API_KEY=sk-ant-...    # console.anthropic.com
OPENROUTER_API_KEY=sk-or-...    # openrouter.ai/keys (free tier available)
```

---

## AI API Keys

| Key | API | Get it |
|-----|-----|--------|
| `OPENAI_API_KEY` | OpenAI | [platform.openai.com](https://platform.openai.com) |
| `GROQ_API_KEY` | Groq | [console.groq.com](https://console.groq.com) |
| `REPLICATE_API_TOKEN` | Replicate | [replicate.com](https://replicate.com) |
| `ELEVENLABS_API_KEY` | ElevenLabs | [elevenlabs.io](https://elevenlabs.io) |
| `STABILITY_API_KEY` | Stability AI | [platform.stability.ai](https://platform.stability.ai) |
| `OPENROUTER_API_KEY` | OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys) |

You don't need all 6 — start with the ones you have.

---

## Skills

| Skill | API | What it does |
|-------|-----|-------------|
| `openai-skill` | OpenAI | Chat, streaming, vision, function calling, embeddings, DALL-E 3 |
| `groq-skill` | Groq | 800+ t/s inference — Llama 3, Mixtral, Whisper |
| `replicate-skill` | Replicate | Flux, SDXL, Llama and 1000+ models via prediction API |
| `elevenlabs-skill` | ElevenLabs | TTS, voice cloning, speech-to-speech |
| `stability-skill` | Stability AI | SD3 generation + editing (remove-bg, inpaint, outpaint, upscale) |
| `openrouter-skill` | OpenRouter | 200+ models, free tier, fallback routing, cost optimisation |

---

## Agents

| Agent | What it does |
|-------|-------------|
| `gpt-coder` | Production code gen with GPT-4o — TypeScript, Python, tests, review |
| `fast-summarizer` | Bulk text processing at 800+ t/s — summaries, extraction, classification |
| `image-generator` | Generate images with Flux/SD3 — prompt engineering and iteration |
| `voice-cloner` | TTS + voice cloning (IVC/PVC) + batch audio production |
| `image-editor` | Remove-bg, inpaint, outpaint, upscale, style transfer |
| `model-router` | Route tasks to the right model — cost vs quality tradeoffs |

---

## Related repos

| Repo | Purpose |
|------|---------|
| [jelly-chain/jelly-ai](https://github.com/jelly-chain/jelly-ai) | This repo — launcher |
| [jelly-chain/jelly-ai-skills](https://github.com/jelly-chain/jelly-ai-skills) | 6 AI API skills |
| [jelly-chain/jelly-ai-agents](https://github.com/jelly-chain/jelly-ai-agents) | 6 agent templates |

---

## License

MIT — see [LICENSE](LICENSE)
