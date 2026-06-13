# Jelly-Research — Agent Context

Multi-tool research AI agent for web search, news monitoring, fact-checking, SERP analysis, competitive intelligence, and web scraping.

---

## API Keys

All keys are stored at `~/.jelly-research/.keys`. Load with:
```javascript
import { readFileSync } from "fs";
import { homedir } from "os";
const keys = Object.fromEntries(
  readFileSync(`${homedir()}/.jelly-research/.keys`, "utf8")
    .split("\n").filter(l => l.includes("="))
    .map(l => l.split("=").map(s => s.trim()))
);
```

Key names in `.keys`:
- `PERPLEXITY_API_KEY` — Perplexity AI search
- `EXA_API_KEY` — Exa neural search
- `NEWSAPI_KEY` — NewsAPI headlines and archive
- `SERPAPI_KEY` — SerpAPI Google/Bing/Scholar results
- `TAVILY_API_KEY` — Tavily LLM-optimised search
- `FIRECRAWL_API_KEY` — Firecrawl web scraping

---

## Skills Location

Skills are installed at `~/.claude/skills/<skill-name>/SKILL.md`.

Available skills (after install-all.sh) — 6 total:
- `perplexity-skill` — Perplexity AI API: real-time synthesis, news, scholar, multi-turn research
- `exa-skill` — Exa API: neural search, `searchAndContents`, `findSimilar`, `getContents`, domain filtering
- `newsapi-skill` — NewsAPI v2: top headlines, everything search, source listing, news monitoring loop
- `serpapi-skill` — SerpAPI: Google web/news/scholar/images, answer box, knowledge graph, PAA extraction
- `tavily-skill` — Tavily API: `search`, `qna`, `extract`, news mode, domain filtering, research pipeline
- `firecrawl-skill` — Firecrawl v1: `scrapeUrl`, `crawlUrl`, `mapUrl`, schema extraction, dynamic page handling

For full API reference and TypeScript examples → see each `~/.claude/skills/<skill-name>/SKILL.md`

---

## Agent Templates

Agents are at `~/.claude/agents/<agent-name>.md`. Invoke inside Claude Code with:
```
/agent <agent-name>
```

All 6 agents:
| Agent | Use case |
|-------|----------|
| `deep-researcher` | Multi-step research chains with chain-of-thought workflow and cited reports |
| `news-monitor` | Real-time news tracking, briefings, and keyword monitoring |
| `fact-checker` | Verify claims with TRUE/FALSE/MISLEADING/UNVERIFIABLE verdicts |
| `serp-analyst` | Google SERP analysis, ranking data, SERP features |
| `competitive-intel` | Competitor profiles, market landscape mapping, company tracking |
| `web-scraper` | Scrape and crawl websites, extract structured data |

For full descriptions and example prompts → see `AGENTS.md` in this directory.

---

## Research Tool Quick Reference

| Tool | Best for | Rate limit |
|------|----------|-----------|
| Perplexity `sonar` | Fast synthesis, news | 50 RPM |
| Perplexity `sonar-pro` | Deep research reports | 50 RPM |
| Exa neural | Semantic source discovery | 10 RPS |
| NewsAPI top-headlines | Breaking news | 100/day (free) |
| SerpAPI Google | SERP data, rankings | 1 RPS (free) |
| Tavily search | LLM-ready web answers | credits |
| Firecrawl scrape | Full page content | 5 RPS (free) |

---

## Research Pipelines — Quick Reference

**Deep research:** Perplexity broad overview → Exa semantic source search → Firecrawl full content → synthesise
**News monitoring:** NewsAPI headlines → Perplexity context → Tavily follow-up
**Fact checking:** SerpAPI primary source search → Firecrawl read document → cross-reference with Exa
**SERP analysis:** SerpAPI SERP data → Firecrawl scrape top pages → Exa find similar content
**Competitive intel:** Exa company search → Firecrawl website scrape → NewsAPI press coverage

---

## Security Rules

- **Never log or print API keys** — not to console, not to files, not in responses
- API key files are gitignored — never commit them
- Always cite sources alongside research findings
- Firecrawl: respect `robots.txt` and site terms of service
- NewsAPI free tier: 100 requests/day — monitor usage carefully
