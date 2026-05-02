# Jelly-Research — Agents Reference (6 agents)

Agents are installed at `~/.claude/agents/<agent-name>.md`.
Invoke inside Claude Code with `/agent <agent-name>`.

---

## deep-researcher
**Purpose:** Conduct comprehensive multi-step research on any topic — produces fully cited reports with executive summary, key findings, analysis, and implications. Uses a documented chain-of-thought workflow: scope → broad sweep → deep dive → verify → synthesise.
**Required skills:** `perplexity-skill`, `exa-skill`, `tavily-skill`, `firecrawl-skill`
**Required keys:** `PERPLEXITY_API_KEY`, `EXA_API_KEY`, `TAVILY_API_KEY`, `FIRECRAWL_API_KEY`
**Example prompts:**
- "Research the current state of AI regulation in the EU — I need a full report"
- "Give me a deep dive on Anthropic's competitive position vs OpenAI as of 2025"
- "What do top academic papers say about LLM hallucination reduction techniques?"
- "Research VC funding trends in AI infrastructure from Q1 2024 to Q1 2025"

---

## news-monitor
**Purpose:** Real-time news tracking and briefings — monitor keywords for breaking news, pull daily topic summaries, compare coverage across sources and countries.
**Required skills:** `newsapi-skill`, `perplexity-skill`, `tavily-skill`
**Required keys:** `NEWSAPI_KEY`, `PERPLEXITY_API_KEY`, `TAVILY_API_KEY`
**Example prompts:**
- "What are the top technology news stories today?"
- "Monitor 'Federal Reserve interest rates' and tell me when there's a new development"
- "Give me a daily briefing covering AI, markets, and geopolitics"
- "How has media coverage of OpenAI changed in the last 7 days?"

---

## fact-checker
**Purpose:** Verify any claim — traces it back to primary sources (original studies, government data, official statements) and issues a structured verdict: TRUE / FALSE / MISLEADING / UNVERIFIABLE.
**Required skills:** `perplexity-skill`, `exa-skill`, `serpapi-skill`, `firecrawl-skill`
**Required keys:** `PERPLEXITY_API_KEY`, `EXA_API_KEY`, `SERPAPI_KEY`, `FIRECRAWL_API_KEY`
**Example prompts:**
- "Fact-check: 'GPT-4 scored in the top 10% on the bar exam'"
- "Verify this stat: '60% of startups fail within 5 years'"
- "Did Elon Musk actually say this? [quote]"
- "Fact-check the top 5 claims in this article: [URL]"

---

## serp-analyst
**Purpose:** Analyse Google Search results for any keyword — extract organic rankings, SERP features (answer boxes, PAA, knowledge graphs), and scrape the top-ranking pages for content analysis.
**Required skills:** `serpapi-skill`, `firecrawl-skill`, `exa-skill`
**Required keys:** `SERPAPI_KEY`, `FIRECRAWL_API_KEY`, `EXA_API_KEY`
**Example prompts:**
- "Analyse the Google SERP for 'best AI coding assistant 2025'"
- "What SERP features show up for 'Federal Reserve interest rates'?"
- "Who are the top 5 ranking domains for 'machine learning tutorial'?"
- "What People Also Ask questions appear for 'cryptocurrency regulation'?"

---

## competitive-intel
**Purpose:** Build competitor profiles, map market landscapes, and track company news — uses public data only (websites, press releases, job postings, news).
**Required skills:** `perplexity-skill`, `exa-skill`, `firecrawl-skill`, `serpapi-skill`, `newsapi-skill`
**Required keys:** `PERPLEXITY_API_KEY`, `EXA_API_KEY`, `FIRECRAWL_API_KEY`, `SERPAPI_KEY`, `NEWSAPI_KEY`
**Example prompts:**
- "Build a competitive profile for Anthropic — funding, products, pricing, recent news"
- "Map the competitive landscape for AI-powered code generation tools"
- "What have Notion's job postings revealed about their upcoming roadmap?"
- "Compare Figma vs Sketch vs Framer: features, pricing, positioning"

---

## web-scraper
**Purpose:** Extract content from any website — single pages, full site crawls, URL mapping, and schema-based structured data extraction for product listings, pricing, job postings, and more.
**Required skills:** `firecrawl-skill`, `exa-skill`, `serpapi-skill`
**Required keys:** `FIRECRAWL_API_KEY`, `EXA_API_KEY`, `SERPAPI_KEY`
**Example prompts:**
- "Scrape this page and give me the main content as markdown: [URL]"
- "Crawl the entire docs site at docs.example.com and summarise each page"
- "Extract all job listings from this careers page: title, location, salary"
- "This SPA loads dynamically — wait 5 seconds then scrape it: [URL]"
