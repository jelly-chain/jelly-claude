# discord-skill

Discord Bot API (discord.js v14) — send messages, embeds, webhooks, manage roles, handle slash commands.

## Install
```bash
bash install.sh
```

## Setup required
1. Create an application at [discord.com/developers/applications](https://discord.com/developers/applications)
2. Go to Bot tab → Add Bot → copy Token
3. Enable "Message Content Intent" in the Bot tab
4. Invite bot to your server using OAuth2 URL Generator
5. Add keys to `~/.jelly-social/.keys`

## Example prompts
- "Send a message to channel #alerts: 'SOL just crossed $150'"
- "Post a rich embed with market data to the #updates channel"
- "Set up a slash command /price that returns the current SOL price"
- "Send a webhook notification to the trading channel"
- "Delete the last 10 messages in #spam"
