# TikTok Skill — TikTok API v2

## Overview
The TikTok API v2 provides access to TikTok's content publishing, research, and analytics capabilities. The **Content Posting API** lets you upload and publish videos programmatically. The **Research API** allows searching public content and trending topics.

## What you need
1. **TikTok developer account** — [developers.tiktok.com](https://developers.tiktok.com)
2. **App registration** — create an app and request sandbox/production access
3. **Client Key + Client Secret** — from the app dashboard
4. **OAuth 2.0 access token** — for content posting (user-specific actions)
5. **Research API access** — requires separate approval from TikTok

## API base URLs
```
Content API:   https://open.tiktokapis.com/v2
Research API:  https://open.tiktokapis.com/v2/research
```

## OAuth 2.0 — Get Access Token

### Step 1 — Authorization URL
```typescript
const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
authUrl.searchParams.set('client_key',     process.env.TIKTOK_CLIENT_KEY!);
authUrl.searchParams.set('scope',          'user.info.basic,video.publish,video.upload');
authUrl.searchParams.set('response_type',  'code');
authUrl.searchParams.set('redirect_uri',   process.env.TIKTOK_REDIRECT_URI!);
authUrl.searchParams.set('state',          'random_csrf_state');
console.log('Authorize at:', authUrl.toString());
```

### Step 2 — Exchange code for token
```typescript
import axios from 'axios';

const tokenRes = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
  client_key:    process.env.TIKTOK_CLIENT_KEY,
  client_secret: process.env.TIKTOK_CLIENT_SECRET,
  code:          CODE_FROM_CALLBACK,
  grant_type:    'authorization_code',
  redirect_uri:  process.env.TIKTOK_REDIRECT_URI,
}, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

const { access_token, refresh_token, open_id } = tokenRes.data;
```

## Get user info
```typescript
const userRes = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
  headers: { Authorization: `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}` },
  params: { fields: 'open_id,union_id,avatar_url,display_name,follower_count,video_count' },
});
console.log(userRes.data.data.user);
```

## Upload and publish a video (2-step)

### Step 1 — Initialize upload
```typescript
const initRes = await axios.post(
  'https://open.tiktokapis.com/v2/post/publish/video/init/',
  {
    post_info: {
      title:          'Check this out! 🌊 #jelly',
      privacy_level:  'PUBLIC_TO_EVERYONE',
      disable_duet:   false,
      disable_stitch: false,
      disable_comment: false,
    },
    source_info: {
      source:    'FILE_UPLOAD',
      video_size: fs.statSync('./video.mp4').size,
      chunk_size: 10_000_000, // 10MB chunks
      total_chunk_count: 1,
    },
  },
  { headers: { Authorization: `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}` } },
);
const { publish_id, upload_url } = initRes.data.data;
```

### Step 2 — Upload video binary
```typescript
import fs from 'fs';

const videoBuffer = fs.readFileSync('./video.mp4');
await axios.put(upload_url, videoBuffer, {
  headers: {
    'Content-Type':  'video/mp4',
    'Content-Range': `bytes 0-${videoBuffer.length - 1}/${videoBuffer.length}`,
    'Content-Length': videoBuffer.length,
  },
});
console.log('Published! Publish ID:', publish_id);
```

## Check publish status
```typescript
const statusRes = await axios.post(
  'https://open.tiktokapis.com/v2/post/publish/status/fetch/',
  { publish_id },
  { headers: { Authorization: `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}` } },
);
console.log('Status:', statusRes.data.data.status); // PROCESSING_UPLOAD | PUBLISH_COMPLETE | FAILED
```

## Research API — Search videos by keyword
```typescript
const searchRes = await axios.post(
  'https://open.tiktokapis.com/v2/research/video/query/',
  {
    query: {
      and: [{ operation: 'IN', field_name: 'keyword', field_values: ['jelly', 'web3'] }],
    },
    start_date: '20240101',
    end_date:   '20240131',
    max_count:  20,
    fields:     'id,create_time,username,region_code,video_description,like_count,comment_count,share_count,view_count',
  },
  { headers: { Authorization: `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}` } },
);
searchRes.data.data.videos.forEach((v: any) => {
  console.log(v.username, '|', v.view_count, 'views |', v.video_description.slice(0, 60));
});
```

## Refresh an expired access token
```typescript
const refreshRes = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
  client_key:    process.env.TIKTOK_CLIENT_KEY,
  client_secret: process.env.TIKTOK_CLIENT_SECRET,
  grant_type:    'refresh_token',
  refresh_token: process.env.TIKTOK_REFRESH_TOKEN,
}, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

const newToken = refreshRes.data.access_token;
```

## Rate limits
- Content Posting API: 30 posts/day per user
- Research API: 1000 requests/day (approved apps)
- Access tokens expire after 24 hours; refresh tokens last 365 days

## Key names (store in ~/.jelly-social/.keys)
```
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_ACCESS_TOKEN=
TIKTOK_REFRESH_TOKEN=
TIKTOK_OPEN_ID=
TIKTOK_REDIRECT_URI=http://localhost:3000/callback
```
