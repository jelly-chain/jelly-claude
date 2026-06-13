# SEC EDGAR Skill — Filing Retrieval, Full-Text Search & XBRL Data

## Overview
SEC EDGAR is the US Securities and Exchange Commission's public filing database. All public company filings (10-K annual reports, 10-Q quarterly reports, 8-K material events, DEF 14A proxies) are freely available. EDGAR provides a REST API with full-text search, structured XBRL financial data, and filing retrieval — no API key required.

## What you need
- No API key required — EDGAR is a public government API
- Set a custom User-Agent header (required by SEC): `User-Agent: YourName your@email.com`
- Store email at `~/.jelly-forex/.keys` as `SEC_USER_AGENT` (format: `"MyApp myemail@example.com"`)

## API base URLs
```
https://efts.sec.gov/LATEST/search-index?q=...   # Full-text search
https://data.sec.gov/submissions/CIK{cik}.json    # Company filings
https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json  # XBRL facts
https://www.sec.gov/cgi-bin/browse-edgar           # EDGAR search
```

## Authentication (User-Agent header)
```typescript
const SEC_HEADERS = {
  'User-Agent': process.env.SEC_USER_AGENT ?? 'JellyForex research@example.com',
  'Accept-Encoding': 'gzip, deflate',
  'Host': 'data.sec.gov',
};

async function edgarGet(url: string): Promise<any> {
  const res = await fetch(url, { headers: SEC_HEADERS });
  if (!res.ok) throw new Error(`EDGAR error ${res.status}: ${url}`);
  return res.json();
}
```

## Look up a company's CIK number

```typescript
async function lookupCIK(companyName: string): Promise<{ cik: string; name: string }[]> {
  const res = await fetch(
    `https://efts.sec.gov/LATEST/search-index?q="${encodeURIComponent(companyName)}"&dateRange=custom&startdt=2000-01-01&category=form-type&forms=10-K`,
    { headers: SEC_HEADERS }
  );
  const data = await res.json();
  return (data.hits?.hits ?? []).map((h: any) => ({
    cik:  h._source.entity_id,
    name: h._source.display_names?.[0] ?? h._source.entity_name,
  }));
}

// Alternatively, use the company tickers JSON
async function getCIKFromTicker(ticker: string): Promise<string> {
  const res = await fetch('https://www.sec.gov/files/company_tickers.json', { headers: SEC_HEADERS });
  const tickers = await res.json();
  const entry = Object.values(tickers).find((e: any) => e.ticker === ticker.toUpperCase()) as any;
  if (!entry) throw new Error(`Ticker ${ticker} not found in EDGAR`);
  return String(entry.cik_str).padStart(10, '0');  // zero-pad to 10 digits
}

const cik = await getCIKFromTicker('AAPL');
console.log('Apple CIK:', cik);  // 0000320193
```

## Get company filings list

```typescript
interface FilingInfo {
  accessionNumber: string;
  form:            string;
  filedAt:         string;
  reportDate:      string;
  primaryDocument: string;
  documents:       string[];
}

async function getFilings(
  cik: string,
  formType: '10-K' | '10-Q' | '8-K' | 'DEF 14A' = '10-K',
  limit = 10
): Promise<FilingInfo[]> {
  const paddedCIK = cik.padStart(10, '0');
  const data = await edgarGet(`https://data.sec.gov/submissions/CIK${paddedCIK}.json`);
  const filings = data.filings.recent;

  const results: FilingInfo[] = [];
  for (let i = 0; i < filings.form.length && results.length < limit; i++) {
    if (filings.form[i] !== formType) continue;
    const accession = filings.accessionNumber[i].replace(/-/g, '');
    results.push({
      accessionNumber: filings.accessionNumber[i],
      form:            filings.form[i],
      filedAt:         filings.filingDate[i],
      reportDate:      filings.reportDate[i],
      primaryDocument: `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accession}/${filings.primaryDocument[i]}`,
      documents:       [],
    });
  }
  return results;
}

const cik = await getCIKFromTicker('MSFT');
const tenKs = await getFilings(cik, '10-K', 5);
tenKs.forEach(f => console.log(f.form, f.filedAt, f.primaryDocument));
```

## Fetch and extract filing text

```typescript
async function fetchFilingText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': process.env.SEC_USER_AGENT ?? 'JellyForex research@example.com' },
  });
  if (!res.ok) throw new Error(`Failed to fetch filing: ${res.status}`);
  const html = await res.text();
  // Strip HTML tags for plain text
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/\s{3,}/g, '\n\n')
    .trim();
}

// Extract specific sections from a 10-K
function extractSection(text: string, sectionName: string, maxChars = 5000): string {
  const patterns: Record<string, RegExp> = {
    'risk_factors':     /item\s+1a[\s.]*risk\s+factors/i,
    'business':         /item\s+1[\s.]*business/i,
    'mda':              /item\s+7[\s.]*management.{0,50}discussion/i,
    'liquidity':        /liquidity\s+and\s+capital\s+resources/i,
    'critical_accounting': /critical\s+accounting/i,
  };

  const pattern = patterns[sectionName] ?? new RegExp(sectionName, 'i');
  const match = text.search(pattern);
  if (match === -1) return `Section "${sectionName}" not found`;
  return text.slice(match, match + maxChars);
}
```

## XBRL structured financial data

```typescript
async function getFinancialFacts(cik: string): Promise<{
  revenue: { year: number; value: number }[];
  netIncome: { year: number; value: number }[];
  eps: { year: number; value: number }[];
}> {
  const paddedCIK = cik.padStart(10, '0');
  const data = await edgarGet(`https://data.sec.gov/api/xbrl/companyfacts/CIK${paddedCIK}.json`);

  function extractFact(
    concept: string,
    namespace = 'us-gaap'
  ): { year: number; value: number }[] {
    const facts = data.facts?.[namespace]?.[concept]?.units?.USD ?? [];
    return facts
      .filter((f: any) => f.form === '10-K' && f.filed)
      .map((f: any) => ({ year: parseInt(f.end.slice(0, 4)), value: f.val }))
      .sort((a: any, b: any) => b.year - a.year)
      .slice(0, 10);
  }

  return {
    revenue:   extractFact('RevenueFromContractWithCustomerExcludingAssessedTax') ||
               extractFact('Revenues'),
    netIncome: extractFact('NetIncomeLoss'),
    eps:       data.facts?.['us-gaap']?.['EarningsPerShareBasic']?.units?.['USD/shares']
                ?.filter((f: any) => f.form === '10-K')
                ?.map((f: any) => ({ year: parseInt(f.end.slice(0, 4)), value: f.val }))
                ?.sort((a: any, b: any) => b.year - a.year)
                ?.slice(0, 10) ?? [],
  };
}

const cik = await getCIKFromTicker('NVDA');
const facts = await getFinancialFacts(cik);
console.log('Revenue history:');
facts.revenue.forEach(r => console.log(`  ${r.year}: $${(r.value/1e9).toFixed(1)}B`));
```

## Full-text search across all filings

```typescript
interface SearchResult {
  companyName: string;
  cik: string;
  form: string;
  filedAt: string;
  description: string;
  url: string;
}

async function searchFilings(
  query: string,
  formType = '10-K',
  startDate?: string,
  limit = 10
): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    q: `"${query}"`,
    forms: formType,
    dateRange: 'custom',
    startdt: startDate ?? '2023-01-01',
    hits: limit.toString(),
  });

  const res = await fetch(`https://efts.sec.gov/LATEST/search-index?${params}`, {
    headers: SEC_HEADERS,
  });
  const data = await res.json();

  return (data.hits?.hits ?? []).map((h: any) => ({
    companyName: h._source.display_names?.[0] ?? 'Unknown',
    cik:         h._source.entity_id,
    form:        h._source.form_type,
    filedAt:     h._source.file_date,
    description: h._source.period_of_report ?? '',
    url:         `https://www.sec.gov/Archives/edgar/data/${h._source.entity_id}/${h._source.file_num}`,
  }));
}

// Find all 10-Ks mentioning "artificial intelligence" filed in 2024
const results = await searchFilings('artificial intelligence', '10-K', '2024-01-01', 20);
results.forEach(r => console.log(r.companyName, r.filedAt));
```

## Parse 8-K material events

```typescript
async function getRecent8Ks(cik: string, days = 30): Promise<FilingInfo[]> {
  const cutoff = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const filings = await getFilings(cik, '8-K', 20);
  return filings.filter(f => f.filedAt >= cutoff);
}

// Get all Apple 8-K filings from the last 30 days
const cik = await getCIKFromTicker('AAPL');
const recent = await getRecent8Ks(cik, 30);
recent.forEach(f => console.log(f.filedAt, f.primaryDocument));
```

## Rate limits & caveats
- **No API key required** — EDGAR is a free public service
- **Rate limit:** 10 requests/second per IP (SEC guidance)
- **User-Agent required** — the SEC requires it; without it your requests may be blocked
- **Data freshness:** Filings are available within minutes of acceptance
- **XBRL data:** Available for filings from 2009 onwards; older filings are HTML only

## Best practices
- Always set a descriptive `User-Agent` header with a real email address
- Cache CIK lookups — they don't change
- For financial comparisons, use XBRL facts (structured) rather than parsing HTML
- 10-K filings are long — extract specific sections (Risk Factors, MD&A) rather than downloading the whole document
- Use full-text search for thematic research (e.g., find all 10-Ks mentioning "supply chain disruption")
- Pair with alpha-vantage-skill for current market prices to compare with fundamental value
