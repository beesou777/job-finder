# Repository architecture

KamKhoj uses the Next.js App Router. New product pages and API routes belong in `app/`; reusable browser components belong in `components/`; server-side services and shared logic belong in `lib/`.

## Directory guide

- `app/` — routes, pages, layouts, and route handlers
- `components/` — reusable UI grouped by feature (`jobs`, `home`, `linkedin`, etc.)
- `content/` — editorial content
- `server/db/` — TypeORM entities and the database connection
- `server/services/` — server-only search, scraping, quality, rate-limit, and data services
- `lib/` — compatibility exports plus browser-safe shared helpers
- `src/scrapers/` — current scraper engine, grouped by discovery, list pages, detail pages, and core utilities
- `server/scrapers/legacy/` — legacy scraper adapter used only by `/api/scrape/run`
- `scripts/` — operational commands such as scraping, seeding, and TypeORM CLI configuration
- `migrations/` — generated TypeORM migrations; use `yarn migration:generate`
- `public/` — static assets and the service worker
- `types/` — shared ambient type declarations
- `utils/` — source data files used by enrichment workflows

## Scraper note

The application has a legacy scraper adapter in `server/scrapers/legacy/` used by `/api/scrape/run`, and the newer production engine in `src/scrapers/` used by `/api/scrape` and scheduled runs. Do not delete or merge these directories without first migrating the legacy route and verifying scraper output.

## Adding code

Prefer the closest feature directory, use the `@/` path alias for imports, and avoid putting route-specific code in global utilities. Keep database changes in generated files under `migrations/` rather than ad-hoc schema scripts.
