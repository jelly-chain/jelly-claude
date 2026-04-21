# Jelly-AI — Agents Reference (6 agents)

Agents are installed at `~/.claude/agents/<agent-name>.md`.
Invoke inside Claude Code with `/agent <agent-name>`.

---

## gpt-coder
**Purpose:** Generate production-ready code with GPT-4o and structured outputs. TypeScript, Python, and modern JS — code generation, refactoring, test writing, code review, and debugging.
**Required skills:** `openai-skill`
**Required keys:** `OPENAI_API_KEY`
**Example prompts:**
- "Write a TypeScript Express REST API with CRUD for a User entity using Prisma and Zod"
- "Review this code and list all bugs and security issues"
- "Write Jest unit tests for this service class"
- "Refactor this function to use async/await instead of .then() chains"

---

## fast-summarizer
**Purpose:** Bulk text processing at 800+ tokens/second using Groq LPU hardware. Summaries, extraction, classification, meeting notes — for single documents or batches of 100.
**Required skills:** `groq-skill`
**Required keys:** `GROQ_API_KEY`
**Example prompts:**
- "Summarise this 10,000-word research paper in 5 bullet points"
- "Process these 50 customer support tickets and extract common issues"
- "Extract all action items, owners, and deadlines from this meeting transcript"
- "Classify these 100 emails by: urgent/follow-up/FYI/no-action"

---

## image-generator
**Purpose:** Create images from text descriptions using Flux (fast) or SD3 (quality) — with automatic prompt enhancement, model selection, iteration workflow, and batch generation.
**Required skills:** `replicate-skill`, `stability-skill`
**Required keys:** `REPLICATE_API_TOKEN`, `STABILITY_API_KEY`
**Example prompts:**
- "Generate a product photo of a minimalist coffee mug on marble"
- "Create 4 variations of a logo concept for a tech startup"
- "Make a cinematic landscape of a futuristic city at night, blade runner aesthetic"
- "Generate a batch of 10 social media banner variations"

---

## voice-cloner
**Purpose:** Text-to-speech, voice cloning from audio samples, and batch audio production via ElevenLabs. Supports IVC (instant, 1+ min audio) and PVC (professional, 30+ min audio).
**Required skills:** `elevenlabs-skill`
**Required keys:** `ELEVENLABS_API_KEY`
**Example prompts:**
- "Convert this article script to speech using a professional male voice"
- "Clone my voice from these audio samples and use it for this narration"
- "Generate all chapter narrations for this ebook — use voice ID xyz"
- "Create customer service greetings in English, Spanish, and French"

---

## image-editor
**Purpose:** AI-powered image editing without Photoshop — background removal, object replacement (search-and-replace), canvas expansion (outpainting), upscaling, and style transfer.
**Required skills:** `stability-skill`, `replicate-skill`
**Required keys:** `STABILITY_API_KEY`, `REPLICATE_API_TOKEN`
**Example prompts:**
- "Remove the background from this product photo"
- "Replace the sky in this landscape with a dramatic sunset"
- "Expand this square image to a 16:9 banner with matching scenery"
- "Upscale this low-res logo to high quality"

---

## model-router
**Purpose:** AI model selection and routing expert. Recommends the optimal model for any task and budget, designs fallback chains, compares models side-by-side, and optimises AI spending.
**Required skills:** `openrouter-skill`, `openai-skill`, `groq-skill`
**Required keys:** `OPENROUTER_API_KEY`, `OPENAI_API_KEY` (optional), `GROQ_API_KEY` (optional)
**Example prompts:**
- "What's the best model for summarising 500 legal documents cheaply?"
- "Compare GPT-4o vs Claude Sonnet vs DeepSeek R1 on this coding task"
- "I'm spending $500/month on OpenAI — how can I cut costs by 50%?"
- "Design a fallback routing chain for a chatbot that needs 99.9% uptime"
