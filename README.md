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
- Share (Web Share API / clipboard) and print
- Cookie-aware `credentials: 'include'` + CSRF header support (dual-mode with Bearer)
- Basic a11y: skip link, labels, focus-visible, semantic landmarks, viewport meta
- Playwright E2E (mocked API — never hits production Workers/D1)

## Not finished yet

- Full WCAG audit / axe CI gate
- Dropping Bearer/`localStorage` entirely after cookie path verified in staging
- Optional Playwright profile against local Wrangler (backend `test:local-d1` covers API)

## Styling

Styles follow the designer's PNG exports (1512px frames).

- `src/styles/tokens.css` — palette, type scale, spacing, radii, layout and scallop sizes. Change a colour or size here.
- `src/styles/global.css` — reset, body typography, focus ring, `.page-container`, `.visually-hidden` and other shared utilities.
- `src/styles/scallop.module.css` — scalloped edges (hero, footer, mega menu) drawn with gradients; set `--scallop-color`.
- `src/components/<Name>/<Name>.jsx` + `<Name>.module.css` — each component owns its CSS Module. Shared pieces: `Button` (`variant`: primary / outline / text), `Icon`, `Header`, `CategoryNav`, `Footer`, `PageLayout`, `RecipeCard`, `RatingSummary`.
- Fonts: Figtree (headings/body, nearest match to the design's geometric sans) and Inter (a few text blocks), loaded in `index.html`.

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
