# Project Report Draft

## Project Title

Nepal Job Aggregator and Hiring Intelligence Platform

## Abstract

The Nepal Job Aggregator and Hiring Intelligence Platform is a full-stack web application designed to collect, normalize, store, search, and analyze job listings from multiple Nepali job portals. The system addresses the problem of scattered job information by bringing job listings, internships, remote jobs, and location-based vacancies into a centralized platform. It provides users with job browsing, filtering, detail viewing, and application redirection features.

The system also includes an administrative dashboard for scraping control, source monitoring, data quality review, analytics, company enrichment, and opportunity analysis. The project implements logic beyond basic CRUD operations through web scraping, deduplication, category normalization, company fuzzy matching, hiring intent scoring, opportunity scoring, and analytics generation. The application is implemented using Next.js, TypeScript, PostgreSQL, TypeORM, Tailwind CSS, NextAuth, Cheerio, and Axios.

Keywords: job aggregation, web scraping, Nepal jobs, fuzzy matching, hiring intent, analytics, Next.js, PostgreSQL.

## Chapter 1: Introduction

### 1.1 Introduction

Finding suitable job opportunities in Nepal often requires visiting multiple job portals. Different platforms publish listings in different formats, use different category names, and provide varying levels of job details. This creates extra effort for job seekers and makes it difficult to analyze broader hiring trends.

The Nepal Job Aggregator and Hiring Intelligence Platform solves this issue by collecting job listings from multiple sources and displaying them in one searchable platform. It also adds intelligence features for administrators, including company normalization, enrichment, analytics, and hiring intent scoring. The system is intended for job seekers, students searching for internships, administrators, and platform operators who need job market insights.

### 1.2 Problem Statement

Job listings in Nepal are distributed across many websites. Users must manually visit each site, compare listings, check deadlines, and verify application links. This process is inefficient and can cause users to miss relevant opportunities. Existing systems generally provide listings for their own platform only and do not combine multiple sources with consistent categorization, deduplication, and analytics.

The problem can be summarized as:

1. Job information is scattered across multiple portals.
2. Job categories, locations, and job types are inconsistent.
3. Duplicate listings may appear across different sources.
4. Job seekers lack one centralized search and filtering interface.
5. Administrators lack analytical tools for job trends and company hiring activity.

### 1.3 Objectives

The main objective is to develop a complete functioning web-based platform for job aggregation and hiring intelligence.

Specific objectives are:

1. To collect job and internship listings from multiple Nepali job portals.
2. To normalize raw job data into a consistent structure.
3. To store job, category, company, and analytics data in PostgreSQL.
4. To provide search, filtering, pagination, and job detail features.
5. To protect administrative functions using authentication.
6. To implement company matching using exact, domain-based, and fuzzy matching.
7. To calculate hiring intent scores based on company and job activity signals.
8. To provide dashboard analytics for sources, locations, categories, and trends.

### 1.4 Scope and Limitation

#### Scope

The scope of the system includes:

1. Aggregating job listings from supported Nepali job portals.
2. Displaying jobs, internships, remote jobs, and location-specific pages.
3. Searching and filtering jobs by title, company, category, location, urgency, type, and job type.
4. Redirecting users to original job application pages.
5. Admin dashboard for scraping, analytics, source monitoring, SEO pages, data quality, and reports.
6. Company enrichment and canonical company records.
7. Hiring intent and opportunity scoring for companies.
8. Basic blog, static pages, sitemap, robots, and structured data support.

#### Limitations

1. Scrapers depend on the HTML structure of external websites, so selectors may need updates when source websites change.
2. Some external data may be incomplete, outdated, or inconsistent.
3. The scoring model is rule-based and depends on selected signal weights.
4. The system does not guarantee successful job applications because applications are completed on external websites.
5. The project currently focuses mainly on Nepal-related job data and may need adaptation for other countries.

### 1.5 Development Methodology

The project follows an iterative and incremental methodology. The system was divided into modules and implemented progressively. Core job listing and database features were developed first, followed by scraping, filtering, admin features, analytics, company enrichment, and scoring logic.

This methodology was selected because the project depends on several changing factors, especially external job portals. Iterative development makes it easier to test one scraper or module at a time, improve it, and then integrate it into the full system.

### 1.6 Report Organization

This report is organized into five chapters. Chapter 1 introduces the project, problem statement, objectives, scope, limitations, and methodology. Chapter 2 presents background study and literature review. Chapter 3 describes system analysis and design. Chapter 4 explains implementation, testing, and result analysis. Chapter 5 presents conclusion and future recommendations.

## Chapter 2: Background Study and Literature Review

### 2.1 Background Study

#### Job Aggregation

Job aggregation is the process of collecting job postings from different sources and displaying them through a unified interface. A job aggregator reduces the need for users to manually visit multiple job websites. It usually includes data collection, cleaning, deduplication, indexing, and search.

#### Web Scraping

Web scraping is the automated extraction of information from websites. In this project, scraping modules use HTTP requests and HTML parsing to extract job information such as title, company, location, deadline, category, and application URL. Each source website can have a different HTML structure, so separate scraper modules are maintained.

#### Data Normalization

Data normalization converts raw inconsistent values into standard forms. In this project, job categories, company names, job types, and locations may appear in different formats. Normalization improves filtering, searching, matching, and analytics.

#### Fuzzy Matching

Fuzzy matching is used to compare strings that are similar but not exactly equal. This is useful for company names because the same company may appear with abbreviations, suffixes, or spelling variations. The project uses similarity-based matching along with exact domain and normalized name checks.

#### Hiring Intent Scoring

Hiring intent scoring combines different signals to estimate how actively a company is hiring. Signals include career page availability, keyword matches, recent job posting activity, external status, and number of job categories. This creates a decision-support feature for administrators.

### 2.2 Literature Review

Existing job portals provide direct job search features, but they generally operate as independent platforms. A user who wants comprehensive coverage must browse several portals separately. Aggregation systems improve this by collecting listings from multiple sources. Search engines and job boards commonly use indexing, filtering, deduplication, and ranking methods to improve discovery.

Entity resolution and fuzzy matching are also common in data integration systems. These techniques help identify whether two slightly different records refer to the same real-world entity. In this project, company matching applies similar concepts to canonical company records.

Scoring models are frequently used in analytics and decision-support systems. They combine multiple weighted signals into a single measurable score. The project applies this idea to hiring intent and opportunity analysis.

## Chapter 3: System Analysis and Design

### 3.1 System Analysis

The system has four main user-facing areas:

1. Public job discovery pages.
2. Job detail and application redirection flow.
3. Admin dashboard and analytics.
4. Backend scraping, normalization, matching, and scoring services.

The application is built as a full-stack Next.js application. Frontend pages are implemented under the `app` and `components` directories. API routes are implemented under `app/api`. Database entities are defined under `entities`. Scrapers and helper modules are placed under `lib/scrapers`, `src/scrapers`, and `app/services`.

### 3.2 Requirement Analysis

#### Functional Requirements

1. Users can browse latest jobs on the homepage.
2. Users can browse all jobs with pagination.
3. Users can view internships and remote jobs separately.
4. Users can search jobs using text keywords.
5. Users can filter jobs by category, location, urgency, type, and job type.
6. Users can open job detail pages.
7. Users can apply by being redirected to the original source URL.
8. Admin users can access the protected admin dashboard.
9. Admin users can trigger scraping through API/dashboard workflows.
10. The system can scrape multiple supported sources in parallel.
11. The system can detect duplicates using application URLs.
12. The system can normalize categories.
13. The system can match company records using domain, exact name, and fuzzy similarity.
14. The system can calculate hiring intent and opportunity scores.
15. The system can generate analytics for dashboard visualization.

#### Non-Functional Requirements

1. Usability: The interface should be responsive and easy to scan.
2. Security: Admin features should require authentication.
3. Performance: Listing pages should use pagination, indexes, and caching headers.
4. Maintainability: Scrapers and services should be modular.
5. Reliability: Scraper failures should not stop all other scrapers.
6. Scalability: The database structure should support growing job and company records.

### 3.3 Feasibility Analysis

#### Technical Feasibility

The project is technically feasible using the selected stack. Next.js provides frontend and backend routes. PostgreSQL supports relational data, indexes, and analytical queries. TypeORM provides object-relational mapping. Cheerio and Axios support web scraping. NextAuth supports authentication.

#### Operational Feasibility

The system is practical for job seekers and administrators. Public users can browse jobs without training, while administrators can use dashboard views to manage and analyze data.

#### Economic Feasibility

The project uses open-source technologies. Development and testing can be done locally. Deployment can be done on affordable cloud infrastructure.

#### Schedule Feasibility

The system can be developed in phases during the semester. The core listing and scraping modules can be built first, while analytics and scoring modules can be added later.

### 3.4 Object Modelling

Important classes/entities include:

1. Job: stores job title, company, location, source, apply URL, deadline, expiry date, category, type, description, and timestamps.
2. Category: stores normalized job categories and slugs.
3. User: stores authentication-related user data.
4. CanonicalCompany: stores normalized company name, aliases, domain, and verification status.
5. CompanyEnrichment: stores contact details, career page data, hiring signals, matching metadata, intent score, and approachability score.
6. LinkedInJob: stores LinkedIn job records used for company opportunity analysis.
7. DailyJobStats and DailySourceStats: store analytical snapshots.
8. HiringIntentScoreHistory: stores historical changes in hiring intent scores.

Suggested diagram for final report: class diagram showing Job, Category, User, CanonicalCompany, CompanyEnrichment, LinkedInJob, DailyJobStats, DailySourceStats, and HiringIntentScoreHistory.

### 3.5 Dynamic Modelling

#### Job Search Sequence

1. User opens jobs page.
2. Frontend sends query parameters to jobs API.
3. API builds database query using filters.
4. Database returns matching jobs and total count.
5. API returns paginated response.
6. Frontend renders job cards and pagination controls.

#### Scraping Sequence

1. Admin triggers scraping.
2. Scrape API calls scraper runner.
3. Scraper runner runs source-specific scrapers.
4. Each scraper fetches and parses external pages.
5. Results are combined.
6. System checks duplicates using application URL.
7. New jobs are stored in the database.
8. Cache tags are revalidated.
9. Admin receives scraping result summary.

#### Company Matching Sequence

1. External company data is received.
2. System normalizes the company name.
3. System checks domain match.
4. System checks exact normalized name match.
5. System compares fuzzy similarity with existing companies and aliases.
6. System returns match result with confidence.
7. System links to an existing company or creates a new canonical company.

### 3.6 Process Modelling

Suggested activity diagrams:

1. User job search activity.
2. Admin scraping activity.
3. Job deduplication activity.
4. Category normalization activity.
5. Hiring intent score calculation activity.

### 3.7 System Design

#### Architecture

The system follows a full-stack web architecture:

1. Presentation Layer: React components, Tailwind CSS, Shadcn-style UI components, job cards, filters, dashboard views.
2. Application Layer: Next.js pages, server components, route handlers, service modules.
3. Data Layer: PostgreSQL database accessed through TypeORM entities and repositories.
4. Integration Layer: Scrapers using Axios and Cheerio to collect data from external job portals.
5. Intelligence Layer: category normalization, company matching, hiring intent scoring, opportunity scoring, and analytics.

#### Major Modules

| Module | Description | Example Files |
| --- | --- | --- |
| Job Listing | Displays and filters jobs | `app/jobs/page.tsx`, `components/jobs/*`, `components/JobCard.tsx` |
| Homepage | Shows hero, search, stats, latest jobs, internships | `app/page.tsx`, `components/home/*` |
| API | Provides job, category, analytics, scrape, chat, company endpoints | `app/api/*` |
| Scraper | Collects jobs from external portals | `lib/scrapers/*`, `src/scrapers/*`, `lib/scraper-runner.ts` |
| Database | Defines persistent entities | `entities/*` |
| Admin | Provides dashboard views | `app/admin/page.tsx`, `components/admin/*` |
| Analytics | Calculates and displays statistics | `app/services/AnalyticsService.ts`, `components/admin/Charts/*` |
| Company Intelligence | Matches, enriches, scores companies | `app/services/CompanyMatchingService.ts`, `app/services/HiringIntentScoringService.ts` |

### 3.8 Component Design

Important frontend components include:

1. `LatestJobs`: shows latest job listings on the homepage.
2. `LatestInternships`: shows recent internship listings.
3. `HomeSearch`: provides homepage search.
4. `JobCard`: displays job summary information.
5. `JobsFiltering`: provides filters for job browsing.
6. `JobsPagination`: provides paginated navigation.
7. `AdminSidebar`: provides admin dashboard navigation.
8. Admin chart components: show category, source, location, growth, and job type analytics.

### 3.9 Deployment Design

The system can be deployed using:

1. Next.js server or Cloudflare/OpenNext deployment.
2. PostgreSQL database server.
3. Environment variables for database URL and authentication secrets.
4. Scheduled scraper execution through server cron, external scheduler, or admin-triggered scraping.

Suggested deployment diagram: Client Browser -> Next.js Application Server -> PostgreSQL Database; Next.js Application Server -> External Job Portals; Admin Browser -> Protected Admin Routes.

### 3.10 Algorithm Details

#### Algorithm 1: Multi-Source Job Scraping

Input: List of supported job portal scrapers.

Output: Combined list of job records.

Steps:

1. Initialize empty result list.
2. Run source-specific scrapers in parallel.
3. For each fulfilled scraper result, append jobs to the result list.
4. For each failed scraper result, log the failure and continue.
5. Return combined job list.

#### Algorithm 2: Job Deduplication

Input: Scraped job record.

Output: Saved job or skipped duplicate.

Steps:

1. Read the job application URL from scraped data.
2. Query the job table for an existing record with the same URL.
3. If the record exists, count it as duplicate.
4. If the record does not exist, create a new job entity.
5. Save the job entity to the database.

#### Algorithm 3: Category Normalization

Input: Raw category name.

Output: Existing or newly created normalized category.

Steps:

1. Trim and lowercase raw category name.
2. Check predefined category mapping.
3. Search exact category match in database.
4. Search case-insensitive category match.
5. Apply controlled fuzzy matching.
6. Create a new category if no match exists.

#### Algorithm 4: Company Matching

Input: External company data.

Output: Matched company, confidence, similarity, and creation decision.

Steps:

1. Normalize company name.
2. Extract domain from website URL.
3. Match by exact domain.
4. Match by exact normalized name.
5. Compare fuzzy similarity against existing company names and aliases.
6. If similarity is at least 94 percent, return high confidence match.
7. If similarity is at least 80 percent, return medium confidence match.
8. Otherwise return low confidence and mark company for creation.

#### Algorithm 5: Hiring Intent Scoring

Input: Company enrichment record and related job activity.

Output: Hiring intent score and level.

Steps:

1. Add score for career page availability.
2. Add score for hiring keyword matches.
3. Add score for active external status.
4. Add score for jobs posted in the last 7 days.
5. Add score for jobs posted in the last 30 days.
6. Add score for multiple job categories.
7. Cap total score at maximum configured score.
8. Convert score into LOW, MEDIUM, HIGH, or VERY_HIGH level.

## Chapter 4: Implementation and Testing

### 4.1 Implementation

The system is implemented as a TypeScript-based Next.js application. It uses React components for the user interface and Next.js route handlers for backend APIs. PostgreSQL is used as the database, and TypeORM entities define the structure of persistent data.

### 4.2 Tools Used

| Tool/Technology | Purpose |
| --- | --- |
| Next.js 14 | Full-stack web application framework |
| React | Component-based frontend development |
| TypeScript | Type-safe application development |
| PostgreSQL | Relational database |
| TypeORM | ORM and database entity management |
| Cheerio | HTML parsing for scraping |
| Axios | HTTP requests for scraping |
| NextAuth | Authentication |
| Tailwind CSS | Styling and responsive UI |
| Lucide React | Icons |
| Recharts | Dashboard charts |
| Zod | Validation support |
| Cloudflare/OpenNext | Deployment support |

### 4.3 Implementation Details of Modules

#### Job Module

The job module stores and displays job listings. The `Job` entity contains fields such as title, company, location, application URL, source, description, category, job type, posting date, expiry date, and listing type. The jobs API supports filtering by job type, urgency, type, category, location, and search text.

#### Scraping Module

The scraping module contains individual scraper files for different job portals. The scraper runner executes multiple scrapers and combines their results. The scrape API saves new jobs and skips duplicates using the unique application URL.

#### Search and Filtering Module

The search and filtering module uses query parameters to dynamically build database queries. It supports keyword search across job title, company, category, and description. It also supports pagination through limit and offset.

#### Category Module

The category module maps raw category names to standard names using predefined mappings and controlled matching. It helps convert values like "IT", "frontend", "backend", and "digital marketing" into consistent categories.

#### Company Intelligence Module

The company intelligence module manages canonical company records, aliases, domains, enrichment data, fuzzy matching, approachability, hiring intent, and opportunity scoring. This module provides analytical value beyond normal job browsing.

#### Admin Module

The admin module provides dashboard screens for overview, source distribution, data quality, company enrichment, reports, predictive insights, opportunities, SEO, navigation, and settings.

#### Analytics Module

The analytics module generates data for charts and reports. It supports administrative decision-making by showing distribution and trend data.

### 4.4 Testing

#### Unit Test Cases

| Test Case | Module | Input | Expected Output |
| --- | --- | --- | --- |
| TC-01 | Category normalization | `it` | `Information Technology` |
| TC-02 | Category normalization | `frontend` | `Web Development` |
| TC-03 | Company name normalization | `ABC Pvt. Ltd.` | `abc` after suffix removal |
| TC-04 | Hiring intent level | score `80` | `HIGH` |
| TC-05 | Hiring intent level | score `120` | `VERY_HIGH` |
| TC-06 | Job deduplication | existing apply URL | duplicate skipped |
| TC-07 | Search filter | keyword in title | matching jobs returned |
| TC-08 | Urgency filter | expiry within 3 days | soon-expiring jobs returned |

#### System Test Cases

| Test Case | Scenario | Steps | Expected Result |
| --- | --- | --- | --- |
| ST-01 | Browse jobs | Open jobs page | Jobs are displayed with pagination |
| ST-02 | Search jobs | Enter keyword and submit | Relevant jobs are displayed |
| ST-03 | Filter by category | Select category | Jobs from selected category are displayed |
| ST-04 | View job details | Click a job | Detail page opens |
| ST-05 | Apply to job | Click apply | User is redirected to original source |
| ST-06 | Admin login | Enter admin credentials | Admin dashboard opens |
| ST-07 | Run scraper | Trigger scrape endpoint/dashboard action | New jobs are saved and duplicates skipped |
| ST-08 | View analytics | Open admin analytics | Charts and summary data are shown |
| ST-09 | Company matching | Enrich company data | Existing company is matched or new one is created |
| ST-10 | Hiring intent scoring | Update enrichment | Score and level are calculated |

### 4.5 Result Analysis

The system successfully demonstrates aggregation of job data from multiple sources and provides a unified browsing interface. Deduplication through unique application URLs reduces repeated job entries. Category normalization improves consistency in filtering and analytics. Company matching helps combine company records that may appear with different names. Hiring intent and opportunity scoring provide decision-support features for administrators.

For final submission, measured results should be added here after testing with real data:

1. Number of supported sources.
2. Number of jobs scraped per source.
3. Number of duplicate jobs skipped.
4. Average scraper execution time.
5. Number of categories normalized.
6. Number of companies matched or created.
7. Example hiring intent scores and explanation.
8. Screenshots of homepage, jobs page, job detail, admin dashboard, analytics, and scraping result.

## Chapter 5: Conclusion and Future Recommendations

### 5.1 Conclusion

The Nepal Job Aggregator and Hiring Intelligence Platform is a complete web-based system that addresses the problem of scattered job listings in Nepal. It collects job data from multiple sources, stores the data in a structured database, provides search and filtering features, and supports administrative analytics. The project includes meaningful logic beyond CRUD operations through scraping, deduplication, category normalization, company matching, hiring intent scoring, opportunity scoring, and analytics.

The system demonstrates the practical application of software development, database design, web scraping, authentication, data processing, and analytical decision support. It is suitable as a final year project because it combines real-world problem solving with system design and implementation depth.

### 5.2 Future Recommendations

Future improvements include:

1. Add automated scheduled scraping using a cron system.
2. Add email or notification alerts for users.
3. Improve recommendation features based on user profile and saved searches.
4. Add resume parsing and job matching.
5. Add advanced duplicate detection using title, company, and location similarity.
6. Add machine learning-based job category prediction.
7. Add employer accounts and direct job posting.
8. Add more source portals and monitor scraper health.
9. Add automated tests for scrapers, APIs, and scoring functions.
10. Improve dashboards with more historical analytics and export options.

## References

[1] Next.js Documentation, "Next.js Docs," Vercel. Available: https://nextjs.org/docs

[2] TypeORM Documentation, "TypeORM," Available: https://typeorm.io/

[3] PostgreSQL Documentation, "PostgreSQL," Available: https://www.postgresql.org/docs/

[4] Cheerio Documentation, "Cheerio," Available: https://cheerio.js.org/

[5] NextAuth.js Documentation, "NextAuth.js," Available: https://next-auth.js.org/

[6] Recharts Documentation, "Recharts," Available: https://recharts.org/

[7] IEEE, "IEEE Reference Guide," Available: https://ieeeauthorcenter.ieee.org/

## Appendices

### Appendix A: Suggested Screenshots

1. Homepage with latest jobs.
2. Jobs listing with filters.
3. Job detail page.
4. Internship page.
5. Remote jobs page.
6. Admin dashboard overview.
7. Source analytics chart.
8. Category analytics chart.
9. Company enrichment page.
10. Scraping result response.

### Appendix B: Suggested Diagrams

1. Use case diagram.
2. Class diagram.
3. Sequence diagram for job search.
4. Sequence diagram for scraping.
5. Activity diagram for deduplication.
6. Activity diagram for company matching.
7. Component diagram.
8. Deployment diagram.

### Appendix C: Important Source Files

1. `entities/Job.ts`
2. `entities/CanonicalCompany.ts`
3. `entities/CompanyEnrichment.ts`
4. `app/api/jobs/route.ts`
5. `app/api/scrape/run/route.ts`
6. `lib/scraper-runner.ts`
7. `lib/category-matcher.ts`
8. `app/services/CompanyMatchingService.ts`
9. `app/services/HiringIntentScoringService.ts`
10. `app/services/OpportunityScoringService.ts`
