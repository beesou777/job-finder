# KamKhoj SEO Keyword-to-Page Map

This map deliberately assigns one primary canonical page per intent. Filter URLs are discovery tools, not separate SEO landing pages.

| Primary intent | Secondary intent | Canonical URL | Page type | Indexing rule | Main internal-link sources | Conflict to avoid |
|---|---|---|---|---|---|---|
| KamKhoj | KamKhoj.com, Nepal job discovery | `https://www.kamkhoj.com/` | Brand/home | INDEX | Logo, navbar, footer, trust pages | Do not target competitor spellings. |
| jobs in Nepal | latest Nepal vacancies | `/jobs-in-nepal` | Curated landing | CONDITIONAL INDEX (10+ results) | Footer, homepage, role/skill pages | `/jobs` remains the product browser; `/jobs?*` is noindex. |
| browse current jobs | job search/filter | `/jobs` | Inventory browser | INDEX only clean page 1 | Global navigation, cards, blog | All query combinations are noindex. |
| jobs in Kathmandu | Kathmandu vacancy | `/jobs-in-kathmandu` | Curated location | CONDITIONAL INDEX (10+ results) | Footer, roles, other curated pages | Raw `/jobs/kathmandu`, `/jobs/location/kathmandu` and query variants stay noindex. |
| jobs in Pokhara | Pokhara vacancy | `/jobs-in-pokhara` | Curated location | CONDITIONAL INDEX (10+ results) | Jobs-in-Nepal, related searches | Raw location/filter pages stay noindex. |
| IT jobs Nepal | developer jobs Nepal | `/it-jobs-nepal` | Curated category | CONDITIONAL INDEX (10+ results) | Footer, roles, skills, blog | `/jobs?search=software` is noindex. |
| banking jobs Nepal | finance/bank vacancy Nepal | `/banking-jobs-nepal` | Curated category | CONDITIONAL INDEX (10+ results) | Accountant role, Kathmandu page | Finance/accounting filters are noindex; accountant has separate role intent. |
| marketing jobs Nepal | digital marketing, sales | `/marketing-jobs-nepal` | Curated category | CONDITIONAL INDEX (10+ results) | Jobs in Nepal, skill links | Search parameters remain noindex. |
| internships in Nepal | internships Kathmandu, fresher opportunities | `/internships-in-nepal` | Curated landing | CONDITIONAL INDEX (10+ results) | Footer, skill/role pages, blog | `/internships` is the browser; filtered variants noindex. |
| browse internships | current internship listings | `/internships` | Inventory browser | INDEX only clean page 1 | Global navigation, homepage | Query and pagination variants are noindex. |
| remote jobs Nepal | work from home Nepal | `/remote-jobs-nepal` | Curated landing | CONDITIONAL INDEX (10+ results) | IT, roles, skills, blog | `/remote-jobs` external inventory remains noindex. |
| frontend developer jobs Nepal | junior frontend, frontend engineer | `/roles/frontend-developer` | Curated role | CONDITIONAL INDEX (5+ results) | Footer, IT, React, software engineer role | Do not create a junior page until sustained inventory and distinct value justify it. |
| software engineer jobs Nepal | junior software engineer | `/roles/software-engineer` | Curated role | CONDITIONAL INDEX (5+ results) | Footer, IT, frontend, Python | Do not split every language/seniority combination. |
| data analyst jobs Nepal | analytics jobs Nepal | `/roles/data-analyst` | Curated role | CONDITIONAL INDEX (5+ results) | IT, Python, internships | Generic `/jobs?search=data analyst` is noindex. |
| accountant jobs Nepal | accounts/finance officer | `/roles/accountant` | Curated role | CONDITIONAL INDEX (5+ results) | Footer, banking, Kathmandu | Banking page owns banking-sector intent. |
| React jobs Nepal | React developer jobs | `/skills/react` | Skill landing | CONDITIONAL INDEX (5+ results) | Frontend role, IT, remote | Frontend role owns general frontend intent. |
| Python jobs Nepal | Python developer/data roles | `/skills/python` | Skill landing | CONDITIONAL INDEX (5+ results) | Software/data roles, IT | Do not publish framework × city pages. |
| JavaScript jobs Nepal | JS developer jobs | `/skills/javascript` | Skill landing | CONDITIONAL INDEX (5+ results) | Frontend/IT pages | Avoid near-duplicate React/frontend copy. |
| career advice Nepal | resumes, interviews, job search | `/blog` and distinct article URLs | Editorial | INDEX only quality-gated posts | Navbar, homepage resources, related posts | No duplicate articles for the same keyword. |
| about KamKhoj | how job aggregation works | `/about` | Trust/entity | INDEX | Footer, contact, policy pages | Do not add invented organization facts. |

## Deferred role opportunities

Backend search counts showed inventory for backend developer, full stack developer, React developer, graphic designer, digital marketing, sales executive, civil engineer, teacher, customer support, QA engineer and DevOps engineer. They were not published in this pass. Add one only after manually validating result precision, unique intent and useful page copy; the count alone is not sufficient.

