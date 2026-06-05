# KamKhoj SEO Audit and Roadmap

Site: https://www.kamkhoj.com  
Date: 2026-06-02  
Scope: technical SEO, collection pages, structured data, internal linking, EEAT, content, backlinks, and 90-day roadmap.

## SEO Scores

Before implementation: 58/100

Key issues: inconsistent canonical host, malformed double-slash URLs, malformed robots sitemap URL, missing high-intent landing pages, weak programmatic pages, limited internal linking from job cards, thin EEAT pages, and incomplete sitemap coverage.

After implementation: 84/100

Remaining work: measure real Core Web Vitals in Search Console/CrUX, add first-party company detail data when available, expand real editorial content, earn backlinks, and validate live JobPosting eligibility after deployment.

## Priority List

High:
- Standardize canonical host to `https://www.kamkhoj.com`.
- Fix `robots.txt` sitemap URL.
- Add target keyword collection pages.
- Add FAQ schema and canonical metadata on landing pages.
- Add crawlable location, company, skill, and category paths.
- Link job cards to company, location, category, and apply redirect routes.
- Preserve original source attribution.

Medium:
- Expand sitemap with dynamic DB-driven categories, companies, skills, and locations.
- Add author pages once authorship data is available.
- Add original market data reports for backlink acquisition.
- Add real OG images for major content categories.
- Add pagination metadata where result pages expose `page`.

Low:
- Add hreflang if Nepali-language pages are created.
- Add video/image assets for Discover-focused articles.
- Add breadcrumbs visually on all listing variants.

## Technical SEO Implementation Summary

Implemented:
- `lib/site.ts` with canonical site constants and URL helpers.
- Canonical and Open Graph cleanup across root, jobs, internships, blog, and SEO landing pages.
- `robots.ts` fixed sitemap URL and disallowed non-indexable technical paths.
- `sitemap.ts` expanded with core collection, programmatic, EEAT, and blog URLs.
- Reusable `generateCollectionMetadata`.
- Eight keyword-focused landing pages.
- Programmatic `/jobs/[location]`, `/company/[company]`, and `/skills/[skill]`.
- `/apply/[id]` source-preserving redirect route.
- Job card internal links to company, location, category, and apply route.
- EEAT pages: About, Contact, Editorial Policy.

## Structured Data

Implemented schema types:
- WebSite with SearchAction.
- CollectionPage.
- FAQPage on SEO landing pages.
- BreadcrumbList on existing job/category/detail pages.
- JobPosting on LinkedIn and remote job detail routes.

Google JobPosting requirements covered:
- `title`
- `description`
- `hiringOrganization`
- `employmentType` where available
- `datePosted`
- `validThrough` fallback for applicable detail pages
- `jobLocation`
- `baseSalary` only when available or parseable enough to expose safely
- `url`

Validation note: run Google Rich Results Test after deployment because eligibility depends on rendered live pages, indexing, source quality, and whether Google treats aggregated jobs as acceptable for rich results.

## Page Speed Recommendations

Implemented or retained:
- Server-rendered listing pages with cached data.
- Next font usage.
- Lazy browser loading behavior for standard images where applicable.
- Revalidation for programmatic pages.

Recommended next fixes:
- Move third-party scripts like AdSense, Clarity, Analytics, and chat behind consent or delayed idle loading where business needs allow.
- Replace raw `<img>` tags with `next/image` for large local images.
- Add explicit width/height or aspect-ratio to images to reduce CLS.
- Use Lighthouse CI in GitHub Actions.
- Track LCP element on homepage; likely hero image or H1/search block.
- Audit JavaScript bundle for chat and admin dependencies leaking into public pages.

## Internal Linking Strategy

Rules:
- Job cards link to company pages with `/company/[company]`.
- Job cards link to location pages with `/jobs/[location]`.
- Job cards link to category pages with `/jobs/category/[category]`.
- Skill pages link to IT, remote, and internship pages.
- Collection pages link to related category, city, skill, and blog pages.
- Blog posts should link back to relevant landing pages in the first half of the article.

Future automation:
- Extract skills from job title and description.
- Store normalized skill slugs in a join table.
- Render up to five skill links on each job card.
- Add company pages to sitemap when at least one active job exists.

## Google Discover Optimization

Recommendations:
- Use original, high-quality images on career articles, ideally 1200px wide.
- Keep article titles clear and non-clickbait.
- Refresh article dates only when content materially changes.
- Add author bylines and review dates.
- Use descriptive image filenames and alt text.
- Publish timely Nepal job-market explainers, salary guides, and vacancy roundup articles.

## Backlink Strategy for Nepal Market

Targets:
- Nepali colleges and placement cells.
- IT training institutes.
- Career counseling blogs.
- Local tech communities and meetups.
- HR consultancies and recruitment newsletters.
- Startup directories and founder communities.
- Reddit/Facebook/LinkedIn groups where sharing is allowed.
- Local media covering employment and youth career topics.

Campaign ideas:
- Publish monthly "Nepal Hiring Trends" reports using aggregated job data.
- Create "Top Skills in Nepal Job Vacancies" reports.
- Offer college placement pages linking to internship searches.
- Partner with training institutes for skill-specific job pages.
- Publish salary and vacancy explainers for IT, banking, marketing, and internships.

## 90-Day Roadmap

Days 1-15:
- Deploy technical SEO changes.
- Submit sitemap in Google Search Console.
- Validate robots, canonicals, structured data, and index coverage.
- Run Lighthouse on homepage, jobs, landing, blog, and detail pages.
- Fix any crawl errors from `/jobs/[id]` route migration.

Days 16-30:
- Add DB-driven sitemap entries for active categories, locations, companies, and skills.
- Add skill extraction to job listings.
- Add stronger job detail pages if policy and source constraints allow.
- Add author metadata to blog posts.
- Publish 8 cornerstone articles aligned with landing pages.

Days 31-60:
- Publish 20 supporting articles.
- Launch college/institute outreach.
- Create first Nepal hiring trends report.
- Improve Core Web Vitals based on Search Console data.
- Add schema validation tests for common page templates.

Days 61-90:
- Publish 30 more articles and update underperforming posts.
- Build backlink partnerships with education and tech communities.
- Add company-rich pages for top employers.
- Review Search Console query data and create new programmatic pages based on impressions.
- Refresh metadata and internal links based on ranking movement.

## 100 SEO Article Ideas

| # | Title | Target keyword | Intent | Outline |
|---|---|---|---|---|
| 1 | How to Find Jobs in Nepal in 2026 | jobs in nepal | Informational | Where to search; filters; applying; mistakes |
| 2 | Latest Jobs in Nepal: How to Track Fresh Vacancies | latest jobs in nepal | Informational | Sources; alerts; deadlines; checklist |
| 3 | Best Job Sites in Nepal Compared | best job sites nepal | Commercial | Portals; aggregators; pros; when to use each |
| 4 | MeroJob Alternative: How to Search Across Portals | merojob alternative | Commercial | Alternatives; aggregation; workflow |
| 5 | JobsNepal Alternative for Faster Job Discovery | jobsnepal alternative | Commercial | Comparison; filters; source verification |
| 6 | Kantipur Jobs Guide for Job Seekers | kantipur jobs | Informational | Source overview; applying; alternatives |
| 7 | How to Find IT Jobs in Nepal | IT jobs in nepal | Informational | Skills; companies; job boards; portfolio |
| 8 | Software Engineer Jobs Nepal: Complete Guide | software engineer jobs nepal | Informational | Skills; salaries; interviews; applying |
| 9 | Frontend Developer Jobs Nepal: Skills and Search Tips | frontend developer jobs nepal | Informational | React; JS; portfolio; interview tasks |
| 10 | Remote Jobs Nepal: How to Apply from Nepal | remote jobs nepal | Informational | Time zones; contracts; skills; scams |
| 11 | Internship in Nepal: Student Guide | internship in nepal | Informational | Finding roles; CV; interviews; stipend |
| 12 | Internships in Kathmandu: Best Search Strategy | internships in kathmandu | Informational | Industries; commute; applications |
| 13 | Banking Jobs Nepal: Eligibility and Search Tips | banking jobs nepal | Informational | Roles; requirements; exams; deadlines |
| 14 | Job Vacancy in Kathmandu: Where to Search | job vacancy in kathmandu | Informational | Locations; industries; filters |
| 15 | Vacancy in Nepal: How to Avoid Missing Deadlines | vacancy in nepal | Informational | Tracking; documents; alerts |
| 16 | Resume Format for Nepal Jobs | resume format nepal | Informational | Structure; examples; ATS; mistakes |
| 17 | Cover Letter Format for Jobs in Nepal | cover letter nepal | Informational | Template; examples; personalization |
| 18 | Interview Tips for Nepal Job Seekers | interview tips nepal | Informational | Prep; questions; salary; follow-up |
| 19 | Salary Negotiation Tips in Nepal | salary negotiation nepal | Informational | Research; timing; scripts |
| 20 | Best Companies Hiring in Nepal | companies hiring in nepal | Informational | Sectors; sources; how to track |
| 21 | Entry-Level Jobs in Nepal for Freshers | fresher jobs nepal | Informational | Roles; CV; skills; search |
| 22 | Online Jobs in Nepal for Students | online jobs nepal students | Informational | Skills; platforms; safety |
| 23 | Part-Time Jobs in Nepal | part time jobs nepal | Informational | Industries; schedule; applications |
| 24 | NGO Jobs in Nepal: How to Apply | NGO jobs nepal | Informational | Sources; CV; competencies |
| 25 | Finance Jobs in Nepal Beyond Banking | finance jobs nepal | Informational | Roles; skills; employers |
| 26 | Accounting Jobs in Nepal: Skills Employers Want | accounting jobs nepal | Informational | Tools; experience; certifications |
| 27 | Digital Marketing Jobs in Nepal | digital marketing jobs nepal | Informational | SEO; ads; content; portfolio |
| 28 | SEO Jobs in Nepal: Career Path | SEO jobs nepal | Informational | Skills; tools; examples |
| 29 | Content Writing Jobs in Nepal | content writing jobs nepal | Informational | Portfolio; niches; applying |
| 30 | Graphic Design Jobs in Nepal | graphic design jobs nepal | Informational | Portfolio; software; interview |
| 31 | UI UX Jobs in Nepal | UI UX jobs nepal | Informational | Case studies; tools; hiring |
| 32 | Data Analyst Jobs in Nepal | data analyst jobs nepal | Informational | Excel; SQL; Python; projects |
| 33 | Python Jobs in Nepal | python jobs nepal | Informational | Roles; skills; projects |
| 34 | React Jobs in Nepal | react jobs nepal | Informational | Skills; portfolio; interview tasks |
| 35 | JavaScript Jobs in Nepal | javascript jobs nepal | Informational | Frontend; backend; projects |
| 36 | QA Jobs in Nepal | QA jobs nepal | Informational | Manual; automation; tools |
| 37 | DevOps Jobs in Nepal | devops jobs nepal | Informational | Cloud; Linux; CI/CD |
| 38 | Laravel Jobs in Nepal | laravel jobs nepal | Informational | PHP; projects; companies |
| 39 | Flutter Jobs in Nepal | flutter jobs nepal | Informational | Mobile portfolio; interviews |
| 40 | WordPress Jobs in Nepal | wordpress jobs nepal | Informational | Themes; plugins; freelance |
| 41 | Teaching Jobs in Nepal | teaching jobs nepal | Informational | Schools; requirements; applications |
| 42 | Hospitality Jobs in Pokhara | hospitality jobs pokhara | Informational | Hotels; tourism; roles |
| 43 | Sales Jobs in Nepal | sales jobs nepal | Informational | Targets; CV; interviews |
| 44 | Customer Service Jobs in Nepal | customer service jobs nepal | Informational | Skills; scripts; industries |
| 45 | HR Jobs in Nepal | HR jobs nepal | Informational | Recruitment; payroll; employee relations |
| 46 | Operations Jobs in Nepal | operations jobs nepal | Informational | Admin; logistics; skills |
| 47 | Admin Jobs in Nepal | admin jobs nepal | Informational | Duties; documents; applications |
| 48 | Government Jobs vs Private Jobs in Nepal | government jobs nepal private jobs | Informational | Pros; cons; preparation |
| 49 | How to Read a Job Description in Nepal | job description nepal | Informational | Requirements; red flags; fit |
| 50 | How to Spot Job Scams in Nepal | job scams nepal | Informational | Warning signs; verification |
| 51 | How to Apply for Jobs Through Email in Nepal | job application email nepal | Informational | Subject; body; attachment |
| 52 | LinkedIn Profile Tips for Nepal Job Seekers | linkedin profile nepal | Informational | Headline; experience; networking |
| 53 | Portfolio Guide for Nepali Developers | developer portfolio nepal | Informational | Projects; GitHub; case studies |
| 54 | GitHub Tips for Software Jobs in Nepal | github software jobs nepal | Informational | Repos; README; proof |
| 55 | Fresh Graduate Career Guide Nepal | fresh graduate jobs nepal | Informational | First job; internships; skills |
| 56 | Career Change Guide for Nepal | career change nepal | Informational | Transferable skills; CV |
| 57 | Women Returning to Work in Nepal | returnship nepal | Informational | Resume gaps; flexible roles |
| 58 | Best Skills for Jobs in Nepal | job skills nepal | Informational | IT; communication; finance |
| 59 | High-Demand Jobs in Nepal | high demand jobs nepal | Informational | Sectors; skills; outlook |
| 60 | Nepal Job Market Trends 2026 | nepal job market trends | Informational | Sectors; locations; skills |
| 61 | Kathmandu Job Market Guide | kathmandu jobs | Informational | Industries; commute; search |
| 62 | Lalitpur Jobs Guide | lalitpur jobs | Informational | IT; startups; locations |
| 63 | Bhaktapur Jobs Guide | bhaktapur jobs | Informational | Local roles; commute |
| 64 | Pokhara Jobs Guide | pokhara jobs | Informational | Tourism; education; remote |
| 65 | Chitwan Jobs Guide | chitwan jobs | Informational | Sectors; local search |
| 66 | Butwal Jobs Guide | butwal jobs | Informational | Trade; services; industry |
| 67 | Biratnagar Jobs Guide | biratnagar jobs | Informational | Industry; finance; trade |
| 68 | How to Choose Between Internship Offers | internship offers nepal | Informational | Learning; stipend; mentor |
| 69 | Paid Internships in Nepal | paid internship nepal | Informational | Where; expectations; search |
| 70 | IT Internships in Nepal | IT internship nepal | Informational | Skills; projects; applying |
| 71 | Marketing Internships in Nepal | marketing internship nepal | Informational | Portfolio; tasks; interviews |
| 72 | Finance Internships in Nepal | finance internship nepal | Informational | Excel; accounting; banks |
| 73 | Remote Internship Guide Nepal | remote internship nepal | Informational | Tools; communication; proof |
| 74 | CV Mistakes Nepali Job Seekers Make | CV mistakes nepal | Informational | Formatting; claims; keywords |
| 75 | ATS Resume Tips for Nepal Jobs | ATS resume nepal | Informational | Keywords; layout; testing |
| 76 | How to Follow Up After Applying | job follow up nepal | Informational | Timing; templates; etiquette |
| 77 | Common Interview Questions in Nepal | interview questions nepal | Informational | Answers; examples; prep |
| 78 | HR Interview Guide Nepal | HR interview nepal | Informational | Salary; notice; behavior |
| 79 | Technical Interview Guide Nepal | technical interview nepal | Informational | Coding; system; portfolio |
| 80 | Salary Expectations for Freshers in Nepal | fresher salary nepal | Informational | Ranges; negotiation; research |
| 81 | Notice Period Guide Nepal | notice period nepal | Informational | Resignation; offers; etiquette |
| 82 | How to Research a Company Before Applying | company research nepal | Informational | Website; reviews; source |
| 83 | Best Questions to Ask Interviewers | interview questions to ask nepal | Informational | Role; growth; culture |
| 84 | Job Application Checklist Nepal | job application checklist nepal | Informational | CV; cover; documents |
| 85 | Documents Needed for Jobs in Nepal | job documents nepal | Informational | CV; certificates; IDs |
| 86 | How to Build a LinkedIn Network in Nepal | linkedin networking nepal | Informational | Connections; messages; groups |
| 87 | Freelance Jobs in Nepal | freelance jobs nepal | Informational | Skills; platforms; payment |
| 88 | Work From Home Jobs in Nepal | work from home jobs nepal | Informational | Roles; setup; scams |
| 89 | Hybrid Jobs in Nepal | hybrid jobs nepal | Informational | Search; expectations; commute |
| 90 | Startup Jobs in Nepal | startup jobs nepal | Informational | Pros; roles; applying |
| 91 | Corporate Jobs in Nepal | corporate jobs nepal | Informational | Roles; CV; interviews |
| 92 | Bank Exam Preparation and Job Search | bank exam nepal jobs | Informational | Prep; vacancies; documents |
| 93 | Insurance Jobs in Nepal | insurance jobs nepal | Informational | Sales; underwriting; claims |
| 94 | Fintech Jobs in Nepal | fintech jobs nepal | Informational | Roles; skills; companies |
| 95 | Tourism Jobs in Nepal | tourism jobs nepal | Informational | Roles; locations; seasonality |
| 96 | Hotel Jobs in Nepal | hotel jobs nepal | Informational | Departments; applications |
| 97 | BPO Jobs in Nepal | BPO jobs nepal | Informational | Skills; shifts; interviews |
| 98 | Call Center Jobs in Nepal | call center jobs nepal | Informational | Skills; salary; shifts |
| 99 | How KamKhoj Compares with Job Portals | job aggregator nepal | Commercial | Aggregator; portals; use cases |
| 100 | Weekly Nepal Vacancy Roundup Template | latest vacancy nepal | Informational | Sectors; deadlines; links |

