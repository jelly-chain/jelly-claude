# Jelly-Research — Skills Reference (6 skills)

Skills are installed at `~/.claude/skills/<skill-name>/SKILL.md`.
After `setup.sh` / `install-all.sh` runs, all 6 are available automatically.

---

## perplexity-skill
**API:** Perplexity AI
**Purpose:** AI-powered web search that synthesises cited answers in real time. Supports 4 model tiers (`sonar`, `sonar-pro`, `sonar-reasoning`, `sonar-reasoning-pro`), focus modes (internet / news / scholar), and multi-turn research conversations.
**Required keys:** `PERPLEXITY_API_KEY`
**Use when:** Synthesising research on a topic, getting cited answers, or building a research conversation.

---

## exa-skill
**API:** Exa (formerly Metaphor)
**Purpose:** Neural semantic search with full-page content retrieval. Unlike keyword search, Exa understands semantic intent. Supports `searchAndContents`, `findSimilar`, `getContents`, domain filtering, and date filtering.
**Required keys:** `EXA_API_KEY`
**Use when:** Finding the most semantically relevant sources, discovering similar content, or retrieving full page text for LLM processing.

---

## newsapi-skill
**API:** NewsAPI v2
**Purpose:** Real-time and historical news from 80,000+ sources. Two endpoints: `top-headlines` (breaking news by country/category) and `everything` (keyword search with date range, source filter, and language options).
**Required keys:** `NEWSAPI_KEY`
**Use when:** Getting current news headlines, searching for topic coverage over time, or building a news monitoring loop.

---

## serpapi-skill
**API:** SerpAPI
**Purpose:** Structured JSON data from Google, Google News, Google Scholar, Google Images, Bing, DuckDuckGo, and more. Returns organic results, answer boxes, knowledge graphs, People Also Ask, and related searches.
**Required keys:** `SERPAPI_KEY`
**Use when:** Analysing what search engines return for a keyword, extracting SERP features, or finding primary academic sources via Google Scholar.

---

## tavily-skill
**API:** Tavily
**Purpose:** LLM-purpose-built search that returns pre-synthesised, LLM-ready results. Includes a Q&A endpoint for direct factual answers, URL content extraction, and news mode with recency filtering.
**Required keys:** `TAVILY_API_KEY`
**Use when:** Getting fast LLM-ready web answers, extracting content from specific URLs, or building research pipelines that need pre-processed content.

---

## firecrawl-skill
**API:** Firecrawl v1
**Purpose:** Convert any website to clean markdown or structured JSON. Handles JS-rendered pages, SPAs, anti-bot measures, and CAPTCHAs. Supports single-page scrape, full-site crawl, URL mapping, and Zod schema-based structured extraction.
**Required keys:** `FIRECRAWL_API_KEY`
**Use when:** Getting full page content from a URL, crawling an entire site, or extracting structured data (pricing, job listings, product details) from web pages.
