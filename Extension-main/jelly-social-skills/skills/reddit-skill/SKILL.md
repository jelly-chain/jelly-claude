# Reddit Skill — Reddit API (OAuth2)

## Overview
Reddit's REST API allows reading posts, comments, and subreddit data, as well as submitting posts, voting, and managing your account. Authentication uses OAuth2 with the `snoowrap` library (the most widely used Node.js Reddit wrapper).

## What you need
1. **Reddit account** — [reddit.com](https://reddit.com)
2. **App registration** — [reddit.com/prefs/apps](https://reddit.com/prefs/apps) → Create App → choose "script" type
3. **Client ID** — shown under your app name
4. **Client Secret** — shown next to "secret"
5. **Username + Password** — your Reddit account credentials (for script-type apps)

## Install
```bash
npm install snoowrap
```

## Authentication
```typescript
import Snoowrap from 'snoowrap';

const r = new Snoowrap({
  userAgent:    'jelly-social/1.0.0 (by u/YourUsername)',
  clientId:     process.env.REDDIT_CLIENT_ID!,
  clientSecret: process.env.REDDIT_CLIENT_SECRET!,
  username:     process.env.REDDIT_USERNAME!,
  password:     process.env.REDDIT_PASSWORD!,
});
```

## Browse a subreddit
```typescript
// Top posts of the week
const posts = await r.getSubreddit('technology').getTop({ time: 'week', limit: 25 });
posts.forEach(p => {
  console.log(`[${p.score}] ${p.title} — ${p.url}`);
});

// Hot posts
const hot = await r.getSubreddit('SolanaNews').getHot({ limit: 10 });

// New posts
const fresh = await r.getSubreddit('CryptoMarkets').getNew({ limit: 20 });
```

## Search Reddit
```typescript
// Search across all of Reddit
const results = await r.search({
  query: 'Solana TVL',
  sort:  'relevance',
  time:  'week',
  limit: 25,
});

// Search within a subreddit
const subResults = await r.getSubreddit('investing').search({
  query: 'earnings play',
  sort:  'top',
  limit: 10,
});
```

## Get post and comments
```typescript
const submission = await r.getSubmission('POST_ID_HERE').fetch();
console.log(submission.title, submission.selftext);

const comments = await submission.comments.fetchAll();
comments.forEach(c => console.log(c.body, '|', c.score, 'upvotes'));
```

## Submit a post
```typescript
// Text post
const post = await r.getSubreddit('test').submitSelfpost({
  title: 'My daily update',
  text:  'Here is what happened today...',
});

// Link post
const link = await r.getSubreddit('SolanaNews').submitLink({
  title: 'New Solana protocol hits $1B TVL',
  url:   'https://example.com/article',
});
```

## Comment on a post
```typescript
await r.getSubmission('POST_ID').reply('Great post! Here is my take...');
```

## Vote on a post
```typescript
await r.getSubmission('POST_ID').upvote();
await r.getSubmission('POST_ID').downvote();
```

## Monitor subreddit for new posts (polling)
```typescript
import { setInterval } from 'timers';

const seen = new Set<string>();
setInterval(async () => {
  const posts = await r.getSubreddit('SolanaNews').getNew({ limit: 10 });
  for (const p of posts) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      console.log('NEW POST:', p.title, '|', p.score, 'upvotes');
    }
  }
}, 60_000); // poll every 60s
```

## Get user info
```typescript
const me = await r.getMe().fetch();
console.log('Username:', me.name, 'Karma:', me.link_karma + me.comment_karma);
```

## Rate limits
- Authenticated: **60 requests/minute**
- Always include a unique `userAgent` string or requests may be throttled

## Error handling
```typescript
try {
  const posts = await r.getSubreddit('nonexistent_sub').getHot({ limit: 5 });
} catch (err: any) {
  if (err.statusCode === 404) console.error('Subreddit not found');
  else console.error('Reddit API error:', err.message);
}
```

## Key names (store in ~/.jelly-social/.keys)
```
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_USERNAME=
REDDIT_PASSWORD=
```
