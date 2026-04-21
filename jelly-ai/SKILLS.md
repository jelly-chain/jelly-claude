# Jelly-AI — Skills Reference (6 skills)

Skills are installed at `~/.claude/skills/<skill-name>/SKILL.md`.
After `setup.sh` / `install-all.sh` runs, all 6 are available automatically.

---

## openai-skill
**API:** OpenAI
**Purpose:** The full OpenAI API surface: chat completions, streaming, structured output (Zod), function calling/tools, vision, embeddings (text-embedding-3), audio transcription (Whisper), and image generation (DALL-E 3).
**Required keys:** `OPENAI_API_KEY`
**Use when:** Generating structured code output, calling external tools via function calling, understanding images, creating semantic search embeddings, or generating images with DALL-E 3.

---

## groq-skill
**API:** Groq
**Purpose:** Ultra-fast LLM inference on Groq LPU hardware at 800+ tokens/second. OpenAI-compatible API with Llama 3.3 70B, Llama 3.1 8B (fastest), Mixtral, Gemma, and Whisper large-v3.
**Required keys:** `GROQ_API_KEY`
**Use when:** Processing large volumes of text quickly, real-time chat (sub-200ms), or any task where latency or throughput matters more than raw model quality.

---

## replicate-skill
**API:** Replicate
**Purpose:** Run any of 1000+ open-source AI models via Replicate's prediction API. Key models: Flux Schnell (fast images), Flux Dev (quality images), SDXL, Llama 3, Whisper. Pay per second of compute.
**Required keys:** `REPLICATE_API_TOKEN`
**Use when:** Generating images with open-source models, running specialised fine-tuned models, or accessing capabilities not available through OpenAI/Anthropic.

---

## elevenlabs-skill
**API:** ElevenLabs
**Purpose:** State-of-the-art text-to-speech synthesis, instant voice cloning (IVC) from 1+ minute of audio, professional voice cloning (PVC) from 30+ minutes, speech-to-speech conversion, and sound effects generation.
**Required keys:** `ELEVENLABS_API_KEY`
**Use when:** Converting text to natural-sounding speech, cloning a voice for consistent brand audio, producing audio content at scale, or building voice-enabled applications.

---

## stability-skill
**API:** Stability AI
**Purpose:** Stable Image API — text-to-image with SD3 Large/Medium/Core/Ultra, plus editing: remove-background, search-and-replace (inpainting), outpainting, upscaling, sketch-to-image, and style transfer.
**Required keys:** `STABILITY_API_KEY`
**Use when:** Generating high-quality images, editing existing photos (remove bg, replace objects, expand canvas), upscaling images, or converting sketches to realistic renders.

---

## openrouter-skill
**API:** OpenRouter
**Purpose:** Unified OpenAI-compatible API for 200+ models — free tier (DeepSeek R1, Llama 3.3 70B, Gemma 3) and paid (Claude Opus/Sonnet, GPT-4o, Gemini Pro). Model routing, fallback chains, and cost optimisation.
**Required keys:** `OPENROUTER_API_KEY`
**Use when:** Accessing models from multiple providers via a single API, using free models for development, building routing strategies, or optimising AI costs across providers.
