# tiktok-skill

TikTok API v2 — upload and publish videos, check publish status, search public content via Research API.

## Install
```bash
bash install.sh
```

## Setup required
1. Create an app at [developers.tiktok.com](https://developers.tiktok.com)
2. Request Content Posting API and (optionally) Research API access
3. Run the OAuth 2.0 authorization flow to get Access + Refresh tokens
4. Add keys to `~/.jelly-social/.keys`

**Note:** Access tokens expire every 24 hours — use the refresh token to renew.

## Example prompts
- "Upload and publish this video to TikTok with caption 'Check this out! 🌊 #web3'"
- "Check the publish status for publish_id: abc123"
- "Search TikTok for videos about 'Solana' from last month"
- "Get my TikTok profile stats (followers, views, video count)"
