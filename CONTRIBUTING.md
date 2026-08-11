# Contributing to KamKhoj

Thanks for helping improve KamKhoj. Small, focused pull requests are easiest to review.

## Before you start

1. Fork the repository and create a branch from the default branch.
2. Install Node.js 18+ (Node 20 LTS recommended) and Yarn 1.22.
3. Copy `.env.example` to `.env.local` and configure a local PostgreSQL database.
4. Run `yarn install` and `yarn dev`.

## Development expectations

- Keep changes scoped and explain user-facing behaviour in the pull request.
- Do not commit `.env` files, API keys, database dumps, scraped personal data, or generated `.next` output.
- Preserve source attribution and link every listing to its original source.
- For schema changes, update the entity first, then run `yarn migration:generate` and review the generated SQL.
- Run `yarn migration:run` against a local database; do not run it against production without a backup.
- Scraper changes must respect source terms, request limits, retries, and the run lock.
- Prefer existing components and utilities over duplicate abstractions.

## Checks before opening a PR

```bash
yarn typecheck
yarn lint
yarn knip
git diff --check
```

Do not run a production build unless the change requires it; CI/deployment performs that check.

## Pull requests

Describe the problem, solution, database/scraper implications, and how you tested it. Include screenshots for meaningful UI changes and call out migration or environment-variable changes.
