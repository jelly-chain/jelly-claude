# browser — Web Browser Automation

Provides browser automation tools for screenshots, form filling, clicking, navigation, and web scraping. Currently returns mock/simulated responses.

## Tools

| Tool | Description |
|------|-------------|
| `screenshot` | Take a screenshot of a `--url`. Returns base64-encoded image |
| `fill` | Fill a form field identified by `--selector` with `--value` |
| `click` | Click an element identified by `--selector` |
| `navigate` | Navigate to a `--url` |
| `scrape` | Scrape data from a page using a `--selector`. Returns title and content |

## Usage

```bash
node modules/browser/run.mjs screenshot --url https://example.com
node modules/browser/run.mjs fill --selector "#email" --value "test@example.com"
node modules/browser/run.mjs click --selector "#submit"
node modules/browser/run.mjs navigate --url https://example.com
node modules/browser/run.mjs scrape --selector "h1"
```

## Notes

- Currently returns mock/simulated responses
- Expected to integrate with Playwright or Puppeteer for real browser automation
- Uses caching (60s TTL)
- CSS selectors are used for element identification
