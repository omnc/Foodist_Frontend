# Foodist Frontend

SPA for [Foodist](https://foodist-frontend.pages.dev/) — React 19 + Vite + React Router, talking to the Cloudflare Workers API.

## Verified features (this branch)

- Login / register with single-submit protection and accessible error alerts
- Session restore via `GET /auth/me` and JWT in `localStorage`
- Home recent-recipe list with links to detail
- Search / meal-type filtering via `/search`
- Recipe create form aligned to backend meal-type enum (no `SNACK`)
- Recipe detail uses API `averageRating`, `authorName`/`user`, `titleImage`/`titleImageUrl`, ingredients, directions, and persisted comments
- Recipe detail Save/Unsave against `/saved-recipes` (duplicate-safe)
- Playwright E2E (mocked API — never hits production Workers/D1)

## Not finished yet

- Share / print
- Full accessibility audit
- Live local-D1 E2E (optional; mocked suite covers UI regression)

## Setup

```bash
npm install
cp .env.example .env   # optional local API override
npm run dev
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run test:e2e` | Playwright auth/recipe/save regression (mocked API) |

E2E installs Chromium via `npx playwright install chromium` on first use.

## Repo hygiene

`node_modules/`, `dist/`, `.idea/`, and `.DS_Store` are gitignored. If they were previously tracked, this branch removes them from the index.

**Owner action:** update the GitHub repository homepage from the obsolete Vercel URL to `https://foodist-frontend.pages.dev/` (API write access not available to this agent).
