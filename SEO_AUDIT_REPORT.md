# KamKhoj SEO Audit Report

Audit date: 2026-09-22  
Canonical site: `https://www.kamkhoj.com`

## Executive summary

KamKhoj is a Next.js 14.2.35 App Router application. The repository already had useful landing pages, job-detail SSR, canonical helpers, robots, a sitemap, blog content, and some structured data. The most harmful issue was that the primary `/jobs` and `/internships` cards were fetched only after client hydration; the deployed `/jobs` HTML contained zero `/job/` links and 60 loading-skeleton elements. Several nested pages also supplied `| KamKhoj` inside a title while the root layout added the same suffix, producing titles such as `... | KamKhoj | KamKhoj`.

The implementation now server-renders primary listings, gives filter/search variants `noindex,follow`, uses crawlable pagination links, normalizes the brand entity, gates job indexing/schema/sitemap output, removes false request-time sitemap freshness, and adds a small inventory-gated role-page system. Homepage hero and testimonial/review copy was not changed.

## Architecture audited

- Framework: Next.js 14.2.35, React 18.3, TypeScript 5.4.
- Router: App Router (`app/`).
- Rendering: mixed static, ISR and dynamic SSR. Job data comes from an external/backend API through server fetch helpers and a browser `/api` rewrite.
- Metadata: root `Metadata` plus route-level static metadata and `generateMetadata` for dynamic routes.
- Canonical source: `lib/site.ts`, using `https://www.kamkhoj.com`.
- Structured data: WebSite, Organization, JobPosting, BlogPosting, BreadcrumbList and selected FAQPage schemas.
- Sitemap: App Router metadata sitemap, cached for one hour, with live job inventory and quality filtering.
- Robots: App Router metadata robots route.
- Authentication/private areas: `/admin`, `/dashboard`, `/login`, `/register`, and interview practice.
- Public inventory types: jobs, internships, curated SEO pages, location/category/skill/company result pages, job details, remote/LinkedIn leads, blog and trust pages.

## Critical problems found

1. `/jobs` and `/internships` returned loading shells instead of job cards in initial HTML. This was verified against the deployed site before implementation.
2. Nested title strings repeated the root brand suffix. Live examples included `/jobs-in-nepal`, `/skills/react`, `/blog`, and `/privacy-policy`.
3. The sitemap used `new Date()` for static pages and as a job fallback on every request, creating false freshness.
4. Job indexability, JobPosting output and sitemap inclusion did not share a reusable quality decision.
5. Pagination used click-only buttons, hard-coded navigation to `/jobs`, and was not a crawlable link graph.
6. The homepage FAQ displayed the same generic answer under unrelated questions.
7. The backend category-detail endpoint returned 404 for valid collection slugs in the audited environment, turning category URLs into false 404s.

## High-priority findings

- Homepage WebSite and Organization entities lacked stable connected `@id` values and the requested alternate site names.
- `og:site_name` and manifest names used lowercase `kamkhoj` in first-party brand signals.
- JobPosting helpers invented fallback values such as `Company`, `Nepal`, current `datePosted`, and a default full-time type.
- Arbitrary curated-page filter parameters were not consistently reflected in server results and were not always forced to `noindex`.
- Homepage opportunity rails were client-only, weakening initial internal links and adding hydration work.
- Static sitemap URLs included pages without checking the same inventory threshold used by page metadata.
- Dynamic company, duplicate location forms, raw categories and LinkedIn/remote lead pages could compete with curated pages if indexed without stronger quality controls.

## Medium- and low-priority findings

- Some older blog copy used inconsistent brand casing or a non-canonical first-party host.
- The category collection contains noisy values such as hashtag and numeric categories. These pages remain `noindex`.
- Some non-core components retain `<img>` lint warnings.
- Admin components retain unrelated React Hook dependency warnings.
- An expired job fixture is not exposed by the active-jobs API, so that state could not be integration-tested against real data.
- Lighthouse was not installed in the repository; production-build HTML, bundle output and responsive source were inspected, but field Core Web Vitals still require post-deploy measurement.

## Route inventory and indexability decisions

| Route family | Decision | Reason |
|---|---|---|
| `/` | INDEX | Canonical brand/home entity with WebSite and Organization schema. |
| `/jobs` | INDEX on clean page 1; NOINDEX on filters/search/page 2+ | Main current inventory; arbitrary facets must not create an index explosion. |
| `/internships` | INDEX on clean page 1; NOINDEX on filters/search/page 2+ | Dedicated inventory; same facet policy as jobs. |
| Curated pages such as `/jobs-in-nepal`, `/jobs-in-kathmandu`, `/it-jobs-nepal` | CONDITIONAL INDEX | Indexed only when live inventory meets the configured minimum; parameter variants are noindex. |
| `/roles/[role]` | CONDITIONAL INDEX | Only four curated roles exist; each requires at least `SEO_MIN_ACTIVE_JOBS` (default 5). |
| `/skills/[skill]` | CONDITIONAL INDEX | Indexes only when the live skill search meets the inventory threshold and has no query parameters. |
| `/job/[id]` | CONDITIONAL INDEX / 404 | Active, complete, non-duplicate quality jobs index; thin/closed/rejected jobs noindex; missing IDs return a real 404. |
| `/jobs/category/[slug]` | NOINDEX | Taxonomy contains noisy/unreliable categories; page remains useful for users and links. |
| `/jobs/location/[city]`, `/jobs/[location]` | NOINDEX | Duplicate intent is owned by curated clean city pages where available. |
| `/company/[company]` | NOINDEX | Search-based company matching is not yet authoritative enough for indexation. |
| `/remote-jobs`, `/remote-jobs/[slug]` | NOINDEX | Separate external inventory with incomplete normalization; curated `/remote-jobs-nepal` owns the intent. |
| `/linkedin-jobs`, `/linkedin-jobs/[slug]` | NOINDEX | External lead/search inventory is not a canonical SEO asset. |
| `/blog`, eligible `/blog/[slug]` | INDEX | Only posts meeting the blog word-count/content gate appear in the index and sitemap. |
| Thin or explicitly excluded blog posts | NOINDEX | Prevents low-quality/cannibalizing articles from entering the index. |
| `/about`, `/contact`, `/how-kamkhoj-works`, policies | INDEX | Trust, attribution and platform explanation. |
| `/login`, `/register`, `/dashboard/*`, `/admin`, interview practice | NOINDEX | Private, account or utility state. |
| `/api/*` | robots DISALLOW | Non-document API surface. |
| Unknown dynamic paths | 404 | No homepage redirect or soft-404 fallback. |
| Legacy UUID under `/jobs/[location]` | REDIRECT | Existing compatibility behavior sends a valid legacy UUID to its external apply source. |

## Duplicate-content findings

- `/jobs?location=Kathmandu`, `/jobs/kathmandu`, `/jobs/location/kathmandu`, and `/jobs-in-kathmandu` represent overlapping intent. The clean curated URL is indexable; parameter and raw location forms remain noindex.
- Category and skill searches can resemble `/jobs?search=...`. Curated pages use self-canonicals; arbitrary search results canonicalize to `/jobs` and are noindex.
- Company search pages are intentionally noindex until company identity matching is more reliable.
- LinkedIn and remote lead pages remain noindex and are excluded from the sitemap.

## Rendering findings

- Before: deployed `/jobs` initial HTML had zero job links and only loading skeletons.
- After: local production HTML for `/jobs`, `/internships`, curated pages, roles and skills contains 12 crawlable `/job/` links on representative pages. The homepage contains server-rendered job links as well.
- Filters remain client-interactive, but navigation triggers App Router server rendering for the resulting URL.
- Pagination is now anchor-based with `rel=prev`/`rel=next` on adjacent controls.

## Structured-data findings

- WebSite and Organization now have stable canonical IDs and are linked with `publisher`.
- Organization data uses no invented social profiles or physical address.
- JobPosting is emitted only for a specific job that passes the complete SEO gate. Missing employer, thin description, expired status, duplicates and rejected classifications prevent output.
- JobPosting no longer fabricates a company, location, employment type, current posting date or salary.
- Job details, curated landing pages and articles include breadcrumb schema matching visible hierarchy.
- BlogPosting retains real frontmatter dates rather than build-time dates.

## Brand findings

- Preferred technical name is now `KamKhoj` in WebSite, Organization, application name, Apple web-app title, manifest, OG site name, footer and visible first-party labels.
- Allowed alternate WebSite names are only `KamKhoj.com` and `kamkhoj.com`.
- No competitor spelling was added to metadata, schema or keyword fields.
- No official organization social URLs were found. Developer/maintainer accounts were not placed in `sameAs`.

## Performance and mobile findings

- Client job-list effects and homepage job-rail effects were removed from primary discovery paths, reducing hydration work and duplicate API fetching.
- Production build completed with shared first-load JS of 88 kB; `/jobs` reported 110 kB first-load JS.
- Existing responsive grid and mobile breakpoints remain intact. Pagination and filter controls preserve usable tap targets.
- Headless Chrome checks at a 390×844 mobile viewport found `body.scrollWidth` and document scroll width equal to 390 px on the homepage, jobs page and representative job detail; no horizontal-overflow element was detected.
- Remaining image warnings are in `PlatformCard` and `RemoteJobDetail`, not the primary job-list LCP path.
- Post-deploy Lighthouse/CrUX checks remain required for real LCP, INP and CLS measurements.

## Internal-linking findings

- Server-rendered job titles now link to detail pages in initial HTML.
- A compact Popular footer group links to the main national, city, IT and approved role pages.
- Role pages link to adjacent roles, skills, locations and curated categories without a keyword-link wall.
- Blog articles retain related-article and current-jobs links.

## Status-code and host findings

- Live checks before deployment: HTTP variants permanently upgraded to HTTPS; `https://kamkhoj.com` then used a temporary 307 to `https://www.kamkhoj.com`.
- A permanent host redirect rule is now present in `next.config.js`. The hosting platform may still intercept the request before Next.js; make the alias redirect permanent in the deployment dashboard if the live response remains 307.
- Missing representative job ID returns 404 with `noindex`.

## Remaining risks by severity

- **P1:** The production hosting alias may continue returning 307 for non-www HTTPS until the platform-level domain redirect is configured as permanent.
- **P1:** Category source data is noisy. Keep category pages noindex until ingestion taxonomy is cleaned and category counts represent reliable classifications.
- **P2:** Sitemap generation supports up to 5,000 active summaries and fetches the API in batches of four. If inventory grows beyond 5,000, add a backend sitemap export or split job sitemaps.
- **P2:** No real expired record was available for end-to-end testing; keep monitoring expired-state behavior and schema removal.
- **P2:** Search Console and field Core Web Vitals were unavailable in the environment.
- **P3:** Replace remaining non-critical raw `<img>` elements where their remote image allowlist and failure behavior can be safely defined.
