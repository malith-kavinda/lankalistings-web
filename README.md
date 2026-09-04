# LankaListings Web

Public marketplace for LankaListings — Next.js 14 App Router, React 18, Tailwind.

Read-only consumer of approved advertisements. It never creates or moderates listings; only ads that a
moderator has approved and that are `active` are visible here.

## Requirements

- Node.js 20+
- A running [`lankalistings-media-service`](https://github.com/malith-kavinda/lankalistings-media-service)

This app is installed independently — it is no longer part of an npm workspace.

## Setup

```bash
npm install
cp .env.example .env.local   # then edit if the API is not on localhost:8001
npm run dev                  # http://localhost:3000
```

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_MEDIA_API_URL` | `http://localhost:8001` | Base URL of the media service |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |

## Behavior notes

`src/lib/listings.ts` fetches `GET /api/v1/advertisements` server-side with `cache: "no-store"` and falls
back to hardcoded sample listings when the service is unreachable or returns no data. A page full of stock
photography means the API call failed — check the media service is running.

## Related repositories

- [`lankalistings-platform`](https://github.com/malith-kavinda/lankalistings-platform) — product docs, PRD, architecture
- [`lankalistings-media-service`](https://github.com/malith-kavinda/lankalistings-media-service) — FastAPI OCR/LLM ingestion service
- [`lankalistings-portal`](https://github.com/malith-kavinda/lankalistings-portal) — moderation portal
- [`lankalistings-mobile`](https://github.com/malith-kavinda/lankalistings-mobile) — Expo app
