# linkedin-skill

LinkedIn API v2 — post text updates, share articles, upload images, manage professional presence.

## Install
```bash
bash install.sh
```

## Setup required
1. Create an app at [linkedin.com/developers/apps](https://linkedin.com/developers/apps)
2. Request "Share on LinkedIn" and "Sign In with LinkedIn" products
3. Run the OAuth 2.0 authorization flow to get an Access Token
4. Add keys to `~/.jelly-social/.keys`

**Note:** Access tokens expire after 60 days — set a calendar reminder to refresh.

## Example prompts
- "Post a LinkedIn update: 'Excited to share our latest milestone! 🚀'"
- "Share this article link on LinkedIn with a short comment"
- "Post an image with a caption to LinkedIn"
- "What is my current LinkedIn follower count?"
