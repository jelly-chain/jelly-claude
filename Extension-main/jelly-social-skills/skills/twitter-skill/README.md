# twitter-skill

X (Twitter) API v2 — post tweets, threads, schedule content, search mentions, upload media.

## Install
```bash
bash install.sh
```

## Setup required
1. Create a developer app at [developer.x.com](https://developer.x.com)
2. Enable OAuth 1.0a and generate Access Token + Secret
3. Copy Bearer Token for read-only access
4. Add keys to `~/.jelly-social/.keys`

## Example prompts
- "Post a tweet: 'Just shipped something new! 🚀'"
- "Thread a 5-part explainer about prediction markets"
- "Search Twitter for mentions of 'Solana TVL' from the last 24 hours"
- "Like and retweet this tweet: [URL]"
- "Schedule a tweet to go out at 9am UTC"
