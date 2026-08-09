# KamKhoj

KamKhoj is an open-source Nepal job discovery platform. It collects public job listings, normalises them, and gives job seekers searchable listings, market insights, career guides, and interview practice tools.

## What is included

- Job aggregation with source links, deduplication, expiry tracking, and search/filter pages.
- Scheduled and manually triggered scrapers with batching, locking, retries, and request metrics.
- Market-insight pages generated from the database with sample-size safeguards.
- Editorial content and trust pages for job-seeker guidance.
- AI-assisted interview practice with a reusable local question bank and deterministic multiple-choice scoring.

## Tech stack

Next.js 14 (App Router), TypeScript, PostgreSQL, TypeORM, Tailwind CSS, Cheerio/Axios, NextAuth, and optional Gemini/OpenRouter integrations.

## Requirements

- Node.js 18 or newer (Node 20 LTS is recommended)
- Yarn 1.22 (the repository package manager) or npm
- PostgreSQL 14+

## Local setup

```bash
git clone https://github.com/<your-account>/<your-repo>.git
cd job-finder
yarn install
Copy-Item .env.example .env.local
```

Fill in `DATABASE_URL`, `NEXTAUTH_SECRET`, and any optional provider keys in `.env.local`. Never commit `.env`, `.env.local`, or real API keys.

Run the development server with `yarn dev` and open <http://localhost:3000>.

## Useful commands

| Command | Purpose |
| --- | --- |
| `yarn dev` | Start the development server |
| `yarn lint` | Run Next.js/ESLint checks |
| `yarn knip` | Find unused files, exports, and dependencies |
| `yarn typecheck` | Run TypeScript without emitting files |
| `yarn scrape` | Run the scraper locally (requires a database) |
| `yarn migrate-job-fingerprints` | Add/backfill job fingerprint columns |
| `yarn migrate-job-lifecycle` | Add job expiry/lifecycle columns |
| `yarn migrate-approachability` | Add company approachability columns |

Database migrations are explicit scripts because schema changes should be reviewed and run against the intended database. Back up production before applying one.

## Project layout

- `app/` — pages, layouts, and API routes
- `components/` — reusable UI components
- `content/` — editorial articles
- `entities/` — TypeORM entities
- `lib/` — database, auth, insights, and shared application services
- `src/scrapers/` — scraper implementations and request controls
- `scripts/` — migrations, seeds, and operational commands
- `.github/workflows/` — scheduled scraper automation

## Data and source policy

KamKhoj is an aggregator. Listings link back to their original source, and users should verify deadlines and requirements on that source before applying. Do not add credentials, private data, or content that a source does not make publicly available. See the editorial policy and disclaimer pages in `app/`.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md). Security issues should be reported privately using [SECURITY.md](SECURITY.md).

## License

No license has been selected for this repository yet. Until one is added, the source is viewable but not automatically licensed for redistribution.
