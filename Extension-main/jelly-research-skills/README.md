# Jelly-Research Skills

> 6 skills for the Jelly-Research AI agent — Perplexity, Exa, NewsAPI, SerpAPI, Tavily, and Firecrawl.

**GitHub:** [github.com/jelly-chain/Extension/jelly-research-skills](https://github.com/jelly-chain/Extension/jelly-research-skills)

Skills teach [Claude Code](https://github.com/anthropics/claude-code) how to search the web, synthesise research, monitor news, and extract web content. Install them and the agent gains instant expertise in research automation.

---

## Install everything at once

```bash
bash install-all.sh       # Mac / Linux
.\install-all.ps1         # Windows PowerShell
```

## Install a single skill

```bash
bash skills/perplexity-skill/install.sh
```

---

## Skill list (6 skills)

| Skill | API | Description |
|-------|-----|-------------|
| `perplexity-skill` | Perplexity AI | AI-powered search with real-time web synthesis and citations |
| `exa-skill` | Exa | Neural semantic search and full-page content crawling |
| `newsapi-skill` | NewsAPI | Headlines and article search from 80,000+ news sources |
| `serpapi-skill` | SerpAPI | Google, Bing, News, Scholar SERP data as clean JSON |
| `tavily-skill` | Tavily | LLM-optimised search with built-in Q&A and content extraction |
| `firecrawl-skill` | Firecrawl | Full-site crawling, page-to-markdown, and structured data extraction |

---

## Skill structure

Each skill follows this layout:
```
skills/<skill-name>/
  SKILL.md        ← knowledge base Claude Code reads (API ref + TypeScript examples)
  install.sh      ← Mac/Linux installer
  install.ps1     ← Windows installer
  README.md       ← docs, required keys
  .keys.example   ← key template (actual .keys file is gitignored)
```

---

## Keys

All keys go in `~/.jelly-research/.keys`. Example:
```
PERPLEXITY_API_KEY=pplx-...
EXA_API_KEY=...
NEWSAPI_KEY=...
SERPAPI_KEY=...
TAVILY_API_KEY=tvly-...
FIRECRAWL_API_KEY=fc-...
```

You don't need all 6 keys to start — install the skills you have keys for.

---

## License

MIT
