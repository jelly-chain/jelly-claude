# LinkedIn Skill — LinkedIn API v2

## Overview
The LinkedIn API v2 allows posting updates, sharing articles, fetching profile data, and managing company pages. OAuth 2.0 is required for all authenticated actions. The `linkedin-api-client` npm package provides a typed wrapper.

## What you need
1. **LinkedIn account** — [linkedin.com](https://linkedin.com)
2. **App** — [linkedin.com/developers/apps](https://linkedin.com/developers/apps) → Create App
3. **OAuth 2.0 credentials** — Client ID + Client Secret
4. **Access Token** — obtained via the OAuth flow (3-legged for personal posts, 2-legged for some company endpoints)
5. **Approved products** — request `Share on LinkedIn` and `Sign In with LinkedIn` in the Products tab

## Install
```bash
npm install axios
```

## Authentication (3-legged OAuth2)

### Step 1 — Redirect user to authorization URL
```typescript
const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('client_id', process.env.LINKEDIN_CLIENT_ID!);
authUrl.searchParams.set('redirect_uri', process.env.LINKEDIN_REDIRECT_URI!);
authUrl.searchParams.set('scope', 'openid profile email w_member_social');
authUrl.searchParams.set('state', 'random_state_string');
console.log('Authorize at:', authUrl.toString());
```

### Step 2 — Exchange code for access token
```typescript
import axios from 'axios';

const tokenRes = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
  params: {
    grant_type:    'authorization_code',
    code:          CODE_FROM_CALLBACK,
    redirect_uri:  process.env.LINKEDIN_REDIRECT_URI,
    client_id:     process.env.LINKEDIN_CLIENT_ID,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET,
  },
});
const accessToken = tokenRes.data.access_token;
// Save this token — it's valid for 60 days
```

## Get your profile (person URN)
```typescript
const profile = await axios.get('https://api.linkedin.com/v2/userinfo', {
  headers: { Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}` },
});
// profile.data.sub is your person URN (e.g. "urn:li:person:abc123")
const personUrn = `urn:li:person:${profile.data.sub}`;
```

## Post a text update
```typescript
const post = {
  author:     personUrn,
  lifecycleState: 'PUBLISHED',
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: { text: 'Just shipped something exciting! 🚀 #BuildInPublic' },
      shareMediaCategory: 'NONE',
    },
  },
  visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
};

await axios.post('https://api.linkedin.com/v2/ugcPosts', post, {
  headers: {
    Authorization:   `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
    'Content-Type':  'application/json',
    'X-Restli-Protocol-Version': '2.0.0',
  },
});
```

## Post with an article/link
```typescript
const post = {
  author:     personUrn,
  lifecycleState: 'PUBLISHED',
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: { text: 'Interesting read on AI agents 👇' },
      shareMediaCategory: 'ARTICLE',
      media: [{
        status: 'READY',
        originalUrl: 'https://example.com/article',
        title: { text: 'Article Title' },
        description: { text: 'Short description of the article' },
      }],
    },
  },
  visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
};
```

## Upload an image and post
```typescript
import fs from 'fs';

// Step 1 — Register image upload
const registerRes = await axios.post(
  'https://api.linkedin.com/v2/assets?action=registerUpload',
  {
    registerUploadRequest: {
      recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
      owner:   personUrn,
      serviceRelationships: [{ relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }],
    },
  },
  { headers: { Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}` } },
);
const uploadUrl  = registerRes.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
const assetUrn   = registerRes.data.value.asset;

// Step 2 — Upload binary
await axios.put(uploadUrl, fs.readFileSync('./image.jpg'), {
  headers: { 'Content-Type': 'image/jpeg' },
});

// Step 3 — Post with the image
const post = {
  author: personUrn,
  lifecycleState: 'PUBLISHED',
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: { text: 'Check out this chart 📊' },
      shareMediaCategory: 'IMAGE',
      media: [{ status: 'READY', media: assetUrn }],
    },
  },
  visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
};
await axios.post('https://api.linkedin.com/v2/ugcPosts', post, {
  headers: { Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}` },
});
```

## Rate limits
- 500 API calls per day per member
- Post frequency: LinkedIn limits excessive automated posting — space posts at least 1 hour apart
- Access tokens expire after 60 days; refresh tokens last 1 year

## Key names (store in ~/.jelly-social/.keys)
```
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_ACCESS_TOKEN=
LINKEDIN_REDIRECT_URI=http://localhost:3000/callback
```
