# Jelly-Research

> Multi-tool research AI agent powered by Claude Code — Perplexity, Exa, NewsAPI, SerpAPI, Tavily, and Firecrawl.

**GitHub:** [github.com/jelly-chain/jelly-research](https://github.com/jelly-chain/Extension/jelly-research)

---

## What is this?

Jelly-Research is a launch wrapper for [Claude Code](https://github.com/anthropics/claude-code) that:
- Installs **6 skills** covering every major research and web-intelligence API
- Loads **6 agent templates** for deep research, news monitoring, fact-checking, SERP analysis, competitive intel, and web scraping
- Includes `CLAUDE.md` — session memory that pre-loads all skill paths and API key locations so Claude starts every session already oriented
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
# 1. Clone the three Jelly-Research repos into the same parent folder
git clone https://github.com/jelly-chain/jelly-research
git clone https://github.com/jelly-chain/jelly-research-skills
git clone https://github.com/jelly-chain/jelly-research-agents

# 2. Run the setup wizard (one time only)
cd jelly-research
bash setup.sh

# 3. Add your API key to .env
nano .env

# 4. Launch the agent
bash jelly-research.sh
```

### Windows (PowerShell)

```powershell
git clone https://github.com/jelly-chain/Extension/jelly-research
git clone https://github.com/jelly-chain/Extension/jelly-research-skills
git clone https://github.com/jelly-chain/Extension/jelly-research-agents

cd jelly-research
.\setup.ps1
.\jelly-research.ps1
```

---

## API Key — which one to use?

### Option A: Anthropic (recommended)
```
ANTHROPIC_API_KEY=sk-ant-...
```
Get one at [console.anthropic.com](https://console.anthropic.com)

### Option B: OpenRouter (free/low-cost)
```
OPENROUTER_API_KEY=sk-or-...
```
Get one at [openrouter.ai/keys](https://openrouter.ai/keys)

---

## Research API Keys

| Key | API | Get it |
|-----|-----|--------|
| `PERPLEXITY_API_KEY` | Perplexity AI | [perplexity.ai](https://www.perplexity.ai) |
| `EXA_API_KEY` | Exa | [exa.ai](https://exa.ai) |
| `NEWSAPI_KEY` | NewsAPI | [newsapi.org](https://newsapi.org) |
| `SERPAPI_KEY` | SerpAPI | [serpapi.com](https://serpapi.com) |
| `TAVILY_API_KEY` | Tavily | [app.tavily.com](https://app.tavily.com) |
| `FIRECRAWL_API_KEY` | Firecrawl | [firecrawl.dev](https://www.firecrawl.dev) |

You don't need all 6 keys. Start with the ones you have.

---

## Skills

| Skill | API | What it does |
|-------|-----|-------------|
| `perplexity-skill` | Perplexity AI | AI-powered synthesis with real-time citations |
| `exa-skill` | Exa | Neural semantic search and page content crawling |
| `newsapi-skill` | NewsAPI | Headlines and article search from 80,000+ sources |
| `serpapi-skill` | SerpAPI | Google/Bing/Scholar SERP data as structured JSON |
| `tavily-skill` | Tavily | LLM-ready search with built-in Q&A and summarisation |
| `firecrawl-skill` | Firecrawl | Full-site crawling, page-to-markdown, structured extraction |

---

## Agents

| Agent | What it does |
|-------|-------------|
| `deep-researcher` | Multi-step research with chain-of-thought + cited comprehensive reports |
| `news-monitor` | Real-time news tracking, briefings, and keyword alerting |
| `fact-checker` | Verifies claims: TRUE / FALSE / MISLEADING / UNVERIFIABLE |
| `serp-analyst` | Google SERP analysis, ranking data, and SERP feature extraction |
| `competitive-intel` | Competitor profiles, market maps, and company news monitoring |
| `web-scraper` | Scrape, crawl, and extract structured data from any website |

---

## Related repos

| Repo | Purpose |
|------|---------|
| [jelly-chain/jelly-research](https://github.com/jelly-chain/Extension/jelly-research) | This repo — launcher + setup |
| [jelly-chain/jelly-research-skills](https://github.com/jelly-chain/Extension/jelly-research-skills) | 6 research API skills |
| [jelly-chain/jelly-research-agents](https://github.com/jelly-chain/Extension/jelly-research-agents) | 6 agent templates |

---

## License

MIT — see [LICENSE](LICENSE)
