# KamKhoj Search Console Deployment Checklist

No Google Search Console credentials or API configuration were present in the repository environment. Complete these actions after deploying the changes.

## Immediately after deployment

1. Verify the `https://www.kamkhoj.com/` property and confirm it is the operational canonical property.
2. Re-test all four protocol/host variants. Confirm non-www HTTPS now returns a permanent redirect, not the pre-deployment 307. If it remains 307, change the hosting-platform domain alias redirect to 308/301.
3. Open `https://www.kamkhoj.com/robots.txt` and confirm the sitemap line points to `https://www.kamkhoj.com/sitemap.xml`.
4. Open the sitemap and spot-check canonical www URLs, meaningful job `lastmod` values, and absence of search/filter/login/dashboard/expired URLs.
5. Submit `/sitemap.xml` in Search Console.
6. Use URL Inspection on the homepage, run the live test, and request indexing after the entity changes deploy.

## Representative URL inspection

- `/`
- `/jobs`
- `/jobs-in-nepal`
- `/jobs-in-kathmandu`
- `/internships`
- `/internships-in-nepal`
- `/it-jobs-nepal`
- `/banking-jobs-nepal`
- `/remote-jobs-nepal`
- `/roles/frontend-developer`
- `/roles/software-engineer`
- `/roles/data-analyst`
- `/roles/accountant`
- `/skills/react`
- one current blog article
- at least three active, complete job URLs
- one expired job URL once a fixture exists
- one intentionally missing job URL (should be 404)

For each representative URL, confirm Google-selected canonical equals the declared canonical, the rendered HTML contains the H1 and primary listings, and no unexpected `noindex` is present.

## Indexing reports to monitor weekly

- Duplicate without user-selected canonical.
- Alternate page with proper canonical (expected for some discovered filter URLs, but investigate volume spikes).
- Crawled — currently not indexed.
- Discovered — currently not indexed.
- Soft 404.
- Redirect errors or chains.
- Server errors and crawl timeouts.
- Blocked by robots where a noindex directive was intended instead.
- Indexed filter/search URLs containing `search`, `category`, `location`, `jobType`, `urgency`, or `page`.

## Structured-data checks

1. Run Rich Results Test on several active job details.
2. Confirm JobPosting contains the actual employer, visible description, real dates and a KamKhoj canonical URL.
3. Confirm expired/closed/thin jobs have no JobPosting.
4. Validate homepage WebSite and Organization JSON-LD in Schema Markup Validator.
5. Confirm there is one WebSite entity and one Organization entity on the homepage with stable IDs.
6. Monitor Search Console enhancement reports for JobPosting parsing errors, while treating normal organic search as the primary success metric.

## Query and performance monitoring

Create a deployment annotation and compare 28-day periods for:

- Branded query: `KamKhoj`.
- Jobs in Nepal.
- Jobs in Kathmandu.
- Frontend developer jobs Nepal.
- Junior frontend developer jobs Nepal (expected to land on the parent frontend role page initially).
- Software engineer jobs Nepal.
- React developer/jobs Nepal.
- Banking jobs Nepal.
- IT jobs Nepal.
- Accountant jobs Nepal.
- Data analyst jobs Nepal.
- Internships in Nepal.
- Remote jobs Nepal.

Track impressions, clicks, CTR, average position, indexed-page count and sitemap discovered/indexed counts. Compare branded results for correct site name and favicon presentation.

## Core Web Vitals

- Check mobile and desktop Core Web Vitals after enough field data accumulates.
- Run PageSpeed Insights on `/`, `/jobs`, one curated role page, one blog article and one job detail.
- Prioritize any template failing LCP 2.5 s, INP 200 ms or CLS 0.1.
- Recheck third-party analytics/chat/ads impact separately from server response and application bundle cost.

