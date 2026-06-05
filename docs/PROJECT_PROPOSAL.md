# Project Proposal

## Title

Nepal Job Aggregator and Hiring Intelligence Platform

## 1. Introduction

Job seekers in Nepal often need to visit multiple job portals to find relevant vacancies, internships, remote jobs, and location-specific opportunities. Employers and platform administrators also need better visibility into job market activity, company hiring behavior, and posting trends. The proposed system is a web-based job aggregation and hiring intelligence platform that collects job data from multiple Nepali job portals, normalizes the collected data, stores it in a centralized database, and provides searchable job discovery features for users.

The system also includes administrative and analytical modules for monitoring sources, viewing platform statistics, enriching company information, identifying hiring intent, and scoring potential business opportunities. This makes the project more than a basic CRUD system because it includes scraping, data normalization, matching, scoring, filtering, analytics, and administrative decision support.

## 2. Problem Statement

Job information in Nepal is scattered across several job portals. A job seeker may miss relevant opportunities because each portal uses different formats, categories, locations, and deadlines. At the same time, manually collecting and analyzing job market information is time-consuming and inconsistent. Existing portals generally focus on posting and browsing jobs, but they do not provide a unified view of job data from multiple sources along with company-level hiring intelligence.

Therefore, there is a need for a centralized system that can collect job listings from different sources, standardize the data, remove duplicates, classify jobs, support search and filtering, and provide analytical insights for platform administrators.

## 3. Objectives

The main objective of this project is to design and develop a complete web-based job aggregation and hiring intelligence platform for Nepal.

Specific objectives are:

1. To scrape job and internship data from multiple Nepali job portals.
2. To normalize and store job listings in a structured PostgreSQL database.
3. To provide searchable and filterable job browsing features for users.
4. To support job categories, job types, locations, expiry dates, and source-based filtering.
5. To provide an admin dashboard for scraping control, analytics, data quality review, and source monitoring.
6. To implement company normalization and fuzzy matching for identifying duplicate or similar companies.
7. To calculate hiring intent and opportunity scores based on job activity and company signals.
8. To generate analytics and reports for job trends, categories, sources, and locations.

## 4. Methodology

The project follows an iterative and incremental development methodology. The system is divided into modules such as authentication, scraping, job management, search and filtering, analytics, company enrichment, and admin dashboard. Each module is designed, implemented, tested, and improved progressively.

The proposed development workflow is:

1. Requirement identification and analysis.
2. Study of existing job portals and related systems.
3. System design using UML diagrams and database modelling.
4. Implementation of frontend, backend APIs, database entities, and scraping modules.
5. Implementation of normalization, matching, and scoring logic.
6. Testing of individual modules and complete system workflows.
7. Result analysis based on scraping output, deduplication, filtering, and scoring behavior.
8. Documentation and final demonstration.

## 5. Requirement Identification

### Functional Requirements

1. The system shall display latest jobs, internships, remote jobs, and categorized job listings.
2. The system shall allow users to search jobs by title, company, category, description, and location.
3. The system shall allow users to filter jobs by category, job type, location, urgency, and listing type.
4. The system shall display detailed job information and redirect users to the original application source.
5. The system shall scrape job listings from multiple supported sources.
6. The system shall avoid duplicate jobs using unique application URLs.
7. The system shall provide admin access for dashboard and scraping operations.
8. The system shall show analytics such as job counts, source distribution, categories, and locations.
9. The system shall normalize company records and support alias-based company matching.
10. The system shall calculate hiring intent and opportunity scores for companies.

### Non-Functional Requirements

1. The system should be responsive and usable on desktop and mobile devices.
2. The system should provide acceptable response time for job listing and filtering operations.
3. The system should protect administrative features using authentication.
4. The system should handle scraper failures gracefully when a source website changes.
5. The system should use structured database indexes for frequently filtered fields.
6. The system should be maintainable through modular services and scraper files.

## 6. Study of Existing System

Existing job portals such as MeroJob, JobsNepal, KantipurJob, KumariJob, RamroJob, and other Nepali platforms provide job listings independently. These systems are useful, but they require users to browse multiple websites separately. Their category names, job types, locations, and listing formats differ from one platform to another.

The proposed system improves this workflow by aggregating listings from multiple sources into a single platform. It also adds analysis features such as source statistics, category distribution, company enrichment, hiring intent scoring, and opportunity scoring.

## 7. Literature Review

The project is related to concepts from web scraping, information retrieval, data normalization, fuzzy string matching, database indexing, recommender-style scoring, and web application development. Job aggregation platforms commonly use crawlers or scrapers to collect structured data from external pages, then clean, normalize, and store the information for search and discovery.

Fuzzy string matching is useful for identifying company name variations such as abbreviations, spelling differences, and suffix differences. Scoring models are used in decision support systems to combine multiple signals into a measurable score. In this project, such concepts are applied to job aggregation and company hiring intelligence.

## 8. Requirement Analysis

The primary actors are:

1. Job Seeker: searches, filters, views, and applies to jobs.
2. Admin: manages scraping, monitors analytics, views data quality, and reviews companies.
3. External Job Portal: provides job listing pages used as scraping sources.
4. System: performs scraping, normalization, matching, scoring, and data storage.

## 9. Feasibility Study

### Technical Feasibility

The system is technically feasible using Next.js, TypeScript, PostgreSQL, TypeORM, Cheerio, Axios, Tailwind CSS, and NextAuth. These tools support full-stack development, database modelling, web scraping, authentication, and responsive UI.

### Operational Feasibility

The system is operationally feasible because users can browse jobs from a simple web interface, while administrators can manage scraping and analytics from a protected dashboard.

### Economic Feasibility

The system can be developed using open-source tools and frameworks. Deployment can be done using cloud platforms such as Vercel, Cloudflare, or a server with PostgreSQL support.

### Schedule Feasibility

The project can be completed within the semester by implementing the core modules first and then expanding analytics, enrichment, and scoring features.

## 10. High Level Design

The system contains the following major modules:

1. User Interface Module: homepage, jobs page, internships page, remote jobs page, job detail pages, and SEO landing pages.
2. Authentication Module: admin login and protected dashboard access.
3. Scraping Module: source-specific scrapers and scraper runner.
4. Job Data Module: database entities, API routes, filtering, search, and pagination.
5. Category Module: category normalization and matching.
6. Company Intelligence Module: company normalization, enrichment, matching, approachability, hiring intent, and opportunity scoring.
7. Analytics Module: source, category, location, growth, and reporting dashboards.
8. Admin Module: executive overview, data quality, sources, SEO, reports, opportunities, and settings views.

## 11. Algorithm Details

### Job Scraping and Deduplication

1. Run source-specific scrapers.
2. Extract title, company, location, source, category, description, and application URL.
3. Combine results from all sources.
4. Check whether the application URL already exists in the database.
5. Save new records and skip duplicate records.

### Category Normalization

1. Convert raw category text to lowercase and trim whitespace.
2. Match known category variations to standard category names.
3. Check exact and case-insensitive matches in the category table.
4. Apply controlled fuzzy matching for meaningful partial matches.
5. Create a new category when no valid match exists.

### Company Matching

1. Normalize company name by lowercasing, removing punctuation, and removing common suffixes.
2. Match by domain if website data is available.
3. Match by exact normalized company name.
4. Match by fuzzy similarity against existing companies and aliases.
5. Assign confidence as high, medium, or low based on similarity threshold.
6. Create a new company if no acceptable match is found.

### Hiring Intent Scoring

1. Check whether the company has a career page.
2. Count hiring-related keyword matches.
3. Evaluate external hiring status.
4. Count jobs posted in the last 7 and 30 days.
5. Count unique job categories.
6. Combine weighted signals into a score.
7. Convert the score into LOW, MEDIUM, HIGH, or VERY_HIGH level.

## 12. Gantt Chart

| Phase | Task | Duration |
| --- | --- | --- |
| Week 1-3 | Requirement analysis, existing system study, proposal preparation | 3 weeks |
| Week 4-5 | UI, database, and architecture design | 2 weeks |
| Week 6-8 | Core job listing, APIs, and database implementation | 3 weeks |
| Week 9-10 | Scraper implementation and deduplication | 2 weeks |
| Week 11-12 | Admin dashboard, analytics, and midterm preparation | 2 weeks |
| Week 13-14 | Company matching, enrichment, and scoring modules | 2 weeks |
| Week 15 | Testing, result analysis, and bug fixing | 1 week |
| Week 16 | Final report, presentation, and demonstration preparation | 1 week |

## 13. Expected Outcome

The expected outcome is a functioning web application that aggregates job and internship listings from multiple Nepali job portals, stores them in a centralized database, allows users to search and filter jobs, and provides administrators with analytics and company intelligence features. The final system should be ready for live demonstration with working frontend pages, backend APIs, database integration, scraper execution, authentication, and analytics views.

## 14. References

[1] Next.js Documentation, "Next.js Docs," Vercel. Available: https://nextjs.org/docs

[2] TypeORM Documentation, "TypeORM," Available: https://typeorm.io/

[3] PostgreSQL Documentation, "PostgreSQL," Available: https://www.postgresql.org/docs/

[4] Cheerio Documentation, "Cheerio," Available: https://cheerio.js.org/

[5] NextAuth.js Documentation, "NextAuth.js," Available: https://next-auth.js.org/

[6] IEEE, "IEEE Reference Guide," Available: https://ieeeauthorcenter.ieee.org/
