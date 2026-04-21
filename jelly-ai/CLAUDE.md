# Jelly-AI — Agent Context

Multi-model AI agent for code generation, text processing, image creation, voice synthesis, and model routing.

---

## API Keys

All keys stored at `~/.jelly-ai/.keys`. Load with:
```javascript
import { readFileSync } from "fs";
import { homedir } from "os";
const keys = Object.fromEntries(
  readFileSync(`${homedir()}/.jelly-ai/.keys`, "utf8")
    .split("\n").filter(l => l.includes("="))
    .map(l => l.split("=").map(s => s.trim()))
);
```

Keys in `.keys`:
- `OPENAI_API_KEY` — GPT-4o, DALL-E 3, Whisper, Embeddings
- `GROQ_API_KEY` — Llama 3, Mixtral, Gemma via Groq LPU
- `REPLICATE_API_TOKEN` — Flux, SDXL, Llama on Replicate
- `ELEVENLABS_API_KEY` — TTS, voice cloning, speech-to-speech
- `STABILITY_API_KEY` — SD3 generation and image editing
- `OPENROUTER_API_KEY` — 200+ models, free tier, routing

---

## Skills Location

Skills are installed at `~/.claude/skills/<skill-name>/SKILL.md`.

Available skills (after install-all.sh) — 6 total:

| Skill | Path | Purpose |
|-------|------|---------|
| `openai-skill` | `~/.claude/skills/openai-skill/SKILL.md` | Chat, streaming, structured output, function calling, vision, embeddings, DALL-E 3, Whisper |
| `groq-skill` | `~/.claude/skills/groq-skill/SKILL.md` | Ultra-fast inference, Llama 3.3 70B, Llama 3.1 8B, Whisper, streaming, bulk processing |
| `replicate-skill` | `~/.claude/skills/replicate-skill/SKILL.md` | Prediction API, Flux Schnell/Dev, SDXL, Llama, async predictions |
| `elevenlabs-skill` | `~/.claude/skills/elevenlabs-skill/SKILL.md` | TTS, IVC voice cloning, PVC training, speech-to-speech, sound effects |
| `stability-skill` | `~/.claude/skills/stability-skill/SKILL.md` | SD3 Large/Medium/Core, remove-bg, search-and-replace, outpaint, upscale |
| `openrouter-skill` | `~/.claude/skills/openrouter-skill/SKILL.md` | 200+ models, free tier, fallback routing, cost calculator, model selection |

---

## Agent Templates

All 6 agents at `~/.claude/agents/<agent-name>.md`. Invoke with `/agent <agent-name>`:

| Agent | Use case |
|-------|----------|
| `gpt-coder` | Production code generation — TypeScript, Python, tests, code review |
| `fast-summarizer` | Bulk text processing at 800+ t/s — summaries, extraction, classification |
| `image-generator` | Text-to-image with Flux/SD3 — prompt enhancement and iteration |
| `voice-cloner` | TTS + IVC/PVC voice cloning + batch audio production |
| `image-editor` | Remove-bg, inpaint, outpaint, upscale, style transfer |
| `model-router` | AI model selection, cost optimisation, fallback routing strategies |

---

## Model Quick Reference

| Task | Best free | Best paid |
|------|-----------|-----------|
| Code generation | `deepseek/deepseek-chat:free` | `gpt-4o` |
| Fast summarisation | Groq `llama-3.1-8b-instant` | Groq `llama-3.3-70b` |
| Complex reasoning | `deepseek/deepseek-r1:free` | `claude-opus-4` |
| Image generation | Replicate Flux Schnell | SD3 Large |
| TTS | ElevenLabs `eleven_turbo_v2_5` | `eleven_multilingual_v2` |
| Vision | `llama-3.2-11b-vision:free` | `gpt-4o` |

---

## Output Conventions
- **Code:** Save to `./output/` or per-project directories
- **Images:** Save to `./generated/` as PNG/WebP
- **Audio:** Save to `./audio/` as MP3
- **Transcripts:** Save to `./transcripts/` as .txt or .json

---

## Security Rules
- **Never log or print API keys** — not to console, not to files, not in responses
- API key files are gitignored — never commit them
- Never include personal voices or audio in generated code examples without consent
- Always warn before batch operations that may incur significant API costs
