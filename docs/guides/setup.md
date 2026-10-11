# Local Setup Guide

## Prerequisites

- Node.js 22.14.0 or newer with npm 11.19.0 or newer (tested on Node.js 24.20.0)
- npm
- A running Docker-compatible runtime for the pinned local Supabase CLI

## Install and start

```bash
cp .env.example .env.local
npm install
```

Before the first local start, configure Google OAuth for this repository:

```bash
cp supabase/.env.example supabase/.env.local
```

Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `supabase/.env.local`. This file is ignored by Git and applies only to this project's local Supabase container. Add this authorized redirect URI to the Google OAuth web client:

```text
http://127.0.0.1:54321/auth/v1/callback
```

The local Supabase config reads the credentials through `env(GOOGLE_CLIENT_ID)` and `env(GOOGLE_CLIENT_SECRET)`. Other repositories with their own Supabase project do not use this file.

The application connection values belong in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local key from supabase status>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then use the normal local workflow:

```bash
npm run supabase:start
npm run supabase:reset
npm run dev
```

## Validate

```bash
npm run lint
npm run typecheck
npm run test --if-present
npm run build
npm run supabase:test
npm run test:e2e
```

Commit the generated `package-lock.json`; CI uses `npm ci`.
