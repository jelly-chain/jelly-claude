# reddit-skill

Reddit API (OAuth2 via snoowrap) — browse subreddits, search posts, submit content, monitor communities.

## Install
```bash
bash install.sh
```

## Setup required
1. Create a "script" type app at [reddit.com/prefs/apps](https://reddit.com/prefs/apps)
2. Copy Client ID and Client Secret
3. Add your Reddit username and password
4. Add keys to `~/.jelly-social/.keys`

## Example prompts
- "Show me the top 10 posts in r/SolanaNews this week"
- "Search Reddit for discussions about Polymarket"
- "Monitor r/CryptoMarkets for any post mentioning 'ETF' in the last hour"
- "Submit a post to r/test titled 'Hello World'"
- "What are the top comments on this Reddit thread: [URL]"
