# Twitter/X Skill — X API v2

## Overview
The X API v2 is the official API for reading and writing tweets, managing accounts, and monitoring conversations on X (formerly Twitter). OAuth 2.0 Bearer Token is used for read-only access; OAuth 1.0a User Context is required for write operations (posting, liking, following).

## What you need
1. **Developer account** — apply at [developer.x.com](https://developer.x.com)
2. **App** — create one inside the Developer Portal
3. **API Key + Secret** — for OAuth 1.0a (write access)
4. **Bearer Token** — for read-only OAuth 2.0
5. **Access Token + Secret** — generated for your own account

## API base URL
```
https://api.twitter.com/2
```

## Authentication

### Read-only (Bearer Token)
```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.twitter.com/2',
  headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
});
```

### Write access (OAuth 1.0a with twitter-api-v2)
```typescript
import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi({
  appKey:            process.env.TWITTER_API_KEY!,
  appSecret:         process.env.TWITTER_API_SECRET!,
  accessToken:       process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret:      process.env.TWITTER_ACCESS_SECRET!,
});

const rwClient = client.readWrite;
```

Install the library:
```bash
npm install twitter-api-v2
```

## Post a tweet
```typescript
const { data: tweet } = await rwClient.v2.tweet('Hello from Jelly-Social!');
console.log('Posted tweet ID:', tweet.id);
```

## Post a thread
```typescript
const tweets = [
  { text: '1/ Thread opener 🧵' },
  { text: '2/ Second thought' },
  { text: '3/ Conclusion' },
];

let replyTo: string | undefined;
for (const t of tweets) {
  const payload: any = { text: t.text };
  if (replyTo) payload.reply = { in_reply_to_tweet_id: replyTo };
  const { data } = await rwClient.v2.tweet(payload);
  replyTo = data.id;
}
```

## Schedule a tweet (using setTimeout / cron)
```typescript
import cron from 'node-cron';

// Post every day at 9am UTC
cron.schedule('0 9 * * *', async () => {
  await rwClient.v2.tweet('Good morning! Daily update 🌊');
});
```

## Search tweets
```typescript
const { data } = await client.v2.search('jelly-chain', {
  'tweet.fields': ['created_at', 'author_id', 'public_metrics'],
  max_results: 10,
});
data.data.forEach(t => console.log(t.text));
```

## Get user timeline
```typescript
const user = await client.v2.userByUsername('elonmusk');
const timeline = await client.v2.userTimeline(user.data.id, {
  max_results: 20,
  'tweet.fields': ['created_at', 'public_metrics'],
});
timeline.data.data.forEach(t => console.log(t.text, t.public_metrics));
```

## Like and retweet
```typescript
const myId = (await rwClient.v2.me()).data.id;
await rwClient.v2.like(myId, tweetId);
await rwClient.v2.retweet(myId, tweetId);
```

## Upload media
```typescript
import fs from 'fs';

const mediaId = await rwClient.v1.uploadMedia(fs.readFileSync('./image.png'), {
  mimeType: 'image/png',
});
await rwClient.v2.tweet({ text: 'Tweet with image', media: { media_ids: [mediaId] } });
```

## Get mentions
```typescript
const me = await rwClient.v2.me();
const mentions = await rwClient.v2.userMentionTimeline(me.data.id, {
  max_results: 20,
  'tweet.fields': ['created_at', 'author_id'],
});
```

## Rate limits
| Endpoint | Free tier | Basic |
|----------|-----------|-------|
| POST /tweets | 17/day | 100/day |
| GET /search | 1 req/15min | 60/15min |
| GET /timelines | 5/15min | 180/15min |

## Error handling
```typescript
import { ApiResponseError } from 'twitter-api-v2';

try {
  await rwClient.v2.tweet('test');
} catch (err) {
  if (err instanceof ApiResponseError) {
    console.error('Rate limit reset:', err.rateLimit?.reset);
    console.error('Errors:', err.data.errors);
  }
}
```

## Key names (store in ~/.jelly-social/.keys)
```
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_BEARER_TOKEN=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=
```
