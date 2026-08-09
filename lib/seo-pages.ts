export type SeoLandingPageConfig = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  keyword: string;
  filter: {
    type?: "job" | "internship";
    location?: string;
    search?: string;
    jobType?: string;
  };
  intro: string[];
  faqs: Array<{ question: string; answer: string }>;
  related: Array<{ href: string; label: string }>;
};

const commonLinks = [
  { href: "/jobs", label: "Latest jobs in Nepal" },
  { href: "/internships", label: "Internships in Nepal" },
  { href: "/jobs/kathmandu", label: "Jobs in Kathmandu" },
  { href: "/skills/react", label: "React jobs in Nepal" },
  { href: "/blog", label: "Career guides" },
];

export const seoLandingPages: Record<string, SeoLandingPageConfig> = {
  "jobs-in-nepal": {
    slug: "jobs-in-nepal",
    title: "Jobs in Nepal | Latest Job Vacancies 2026 | KamKhoj",
    description:
      "Find latest jobs in Nepal from MeroJob, JobsNepal, Kantipur Job, KumariJob and more. Search vacancies by role, company, category, and location.",
    h1: "Jobs in Nepal",
    keyword: "jobs in nepal",
    filter: { type: "job" },
    intro: [
      "KamKhoj helps job seekers find jobs in Nepal without opening every job portal separately. The platform brings publicly available vacancies from multiple Nepali job boards into one search experience, so candidates can compare roles, companies, locations, deadlines, and application links faster. Whether you are looking for entry-level jobs, professional roles, technical openings, NGO vacancies, or private-sector opportunities, this page is designed as a current starting point for Nepal job search.",
      "The Nepal job market changes quickly. New vacancies can appear and close within days, especially for banking, IT, sales, education, hospitality, and development-sector roles. KamKhoj organizes listings by job type, category, location, and source so users can move from broad searches like latest jobs in Nepal to specific queries such as software engineer jobs Nepal, banking jobs Nepal, or job vacancy in Kathmandu.",
      "Because KamKhoj is an aggregator, each listing links back to the original job source for application and final verification. Job seekers should always review the original employer or portal page before applying, but KamKhoj reduces discovery time by putting opportunities from major Nepali sources in one place. Use the filters, browse related city and category pages, and check the career blog for resume and interview guidance tailored to Nepal.",
    ],
    faqs: [
      { question: "Where can I find the latest jobs in Nepal?", answer: "You can search KamKhoj for latest jobs in Nepal aggregated from Nepali job portals and company career pages." },
      { question: "Does KamKhoj accept applications directly?", answer: "No. KamKhoj sends users to the original job source so they can apply on the official portal or employer page." },
      { question: "How often are jobs updated?", answer: "KamKhoj is built for frequent job discovery updates, with active listings prioritized in search and landing pages." },
    ],
    related: commonLinks,
  },
  "internships-in-nepal": {
    slug: "internships-in-nepal",
    title: "Internship in Nepal | Latest Internships in Kathmandu and Nepal",
    description:
      "Find internships in Nepal for students and freshers. Browse IT, marketing, finance, NGO, and remote internship opportunities in Kathmandu and across Nepal.",
    h1: "Internships in Nepal",
    keyword: "internship in nepal",
    filter: { type: "internship" },
    intro: [
      "Finding an internship in Nepal is often the first serious step into a professional career. KamKhoj collects internship listings from multiple Nepali portals so students, recent graduates, and career changers can compare opportunities in one place. This page focuses on internships in Kathmandu, Pokhara, Lalitpur, remote roles, and growing categories such as software development, digital marketing, accounting, design, operations, and customer support.",
      "Internships in Nepal vary widely. Some companies offer structured training with mentors, some provide project-based learning, and others expect interns to contribute immediately. Before applying, candidates should compare the role description, stipend or salary information if available, location, expected working hours, and the original company or portal source. KamKhoj keeps the discovery process simple by showing key details and linking to the original application page.",
      "For better results, search by skill as well as title. Students looking for internships in Kathmandu can try React, Python, content writing, social media, accounting, or graphic design searches. Freshers should also review resume format, interview preparation, and cover letter guidance in the KamKhoj blog. A focused application with relevant coursework, projects, and availability usually performs better than sending the same generic CV everywhere.",
    ],
    faqs: [
      { question: "Which internships are popular in Kathmandu?", answer: "IT, digital marketing, finance, design, content, and NGO internships are commonly searched in Kathmandu." },
      { question: "Can freshers use KamKhoj?", answer: "Yes. KamKhoj includes internships and entry-level vacancies suitable for freshers and students." },
      { question: "Are remote internships available in Nepal?", answer: "Some remote and hybrid internships appear in the listings when employers or portals publish them." },
    ],
    related: [
      { href: "/internships", label: "Browse internship listings" },
      { href: "/jobs/kathmandu", label: "Kathmandu opportunities" },
      { href: "/skills/python", label: "Python internships" },
      { href: "/skills/react", label: "React internships" },
      { href: "/blog/resume-writing-tips-nepal", label: "Resume tips for Nepal" },
    ],
  },
  "it-jobs-nepal": {
    slug: "it-jobs-nepal",
    title: "IT Jobs in Nepal | Software, Frontend and Developer Jobs",
    description:
      "Search IT jobs in Nepal including software engineer, frontend developer, React, Python, QA, DevOps, and remote technology roles.",
    h1: "IT Jobs in Nepal",
    keyword: "IT jobs in nepal",
    filter: { type: "job", search: "software" },
    intro: [
      "IT jobs in Nepal continue to grow as local software companies, startups, outsourcing teams, fintech businesses, and digital agencies hire technical talent. KamKhoj helps developers and technology professionals discover software engineer jobs Nepal, frontend developer jobs Nepal, QA roles, DevOps openings, data jobs, UI/UX roles, and remote technology positions from multiple Nepali job sources.",
      "A strong IT job search should combine job-title searches with skill searches. Candidates can use KamKhoj to look for React, Python, JavaScript, Node.js, Laravel, QA automation, WordPress, Flutter, data analysis, and other technology keywords. Many employers use different job titles for similar work, so skill-based discovery can reveal roles that generic searches miss.",
      "Before applying, review the full role on the original source and compare stack requirements, salary information if published, work mode, office location, and deadline. For junior developers, project links and GitHub profiles often matter as much as formal experience. For experienced engineers, highlighting shipped products, architecture decisions, measurable performance improvements, and leadership experience can improve response rates in Nepal's competitive tech hiring market.",
    ],
    faqs: [
      { question: "What IT jobs are common in Nepal?", answer: "Software development, frontend development, QA, UI/UX, DevOps, support, data, and digital product roles are common." },
      { question: "How do I find frontend developer jobs in Nepal?", answer: "Search for frontend, React, JavaScript, UI developer, and web developer pages on KamKhoj." },
      { question: "Are remote IT jobs available from Nepal?", answer: "Yes, some remote and international technology roles are listed under remote jobs and skill pages." },
    ],
    related: [
      { href: "/skills/react", label: "React jobs in Nepal" },
      { href: "/skills/python", label: "Python jobs in Nepal" },
      { href: "/jobs/category/software-development", label: "Software development jobs" },
      { href: "/remote-jobs-nepal", label: "Remote jobs Nepal" },
      { href: "/blog/it-jobs-nepal", label: "IT career guide" },
    ],
  },
  "remote-jobs-nepal": {
    slug: "remote-jobs-nepal",
    title: "Remote Jobs Nepal | Work From Home and International Remote Jobs",
    description:
      "Find remote jobs Nepal candidates can apply for, including software, design, marketing, support, and international work-from-home roles.",
    h1: "Remote Jobs Nepal",
    keyword: "remote jobs nepal",
    filter: { type: "job", jobType: "remote" },
    intro: [
      "Remote jobs Nepal searches are increasing as candidates look for flexible work, international companies, and work-from-home roles. KamKhoj highlights remote and hybrid opportunities from local and international sources, including software development, customer support, virtual assistance, digital marketing, content, design, product, and operations roles.",
      "Remote hiring is competitive because applicants are often compared across countries. Nepal-based candidates should make applications easy to evaluate by clearly stating time-zone availability, English communication level, portfolio links, relevant tools, internet reliability, and previous remote-work experience. For technical jobs, GitHub, deployed projects, and concise case studies help employers understand capability quickly.",
      "Use this page alongside skill pages such as React and Python and the broader remote jobs section. Always review the original job page before applying, especially for salary, location restrictions, tax requirements, contract terms, and whether the role is fully remote or hybrid. KamKhoj focuses on discovery and source attribution so candidates can move quickly while still verifying details at the source.",
    ],
    faqs: [
      { question: "Can people in Nepal apply for international remote jobs?", answer: "Yes, but candidates should check location eligibility, time-zone expectations, payment terms, and legal requirements on the original job post." },
      { question: "Which skills help with remote jobs?", answer: "Software development, writing, design, marketing, support, data, and operations skills are commonly useful for remote roles." },
      { question: "Is every job on this page fully remote?", answer: "Some listings may be hybrid or location-restricted, so always verify the original source before applying." },
    ],
    related: [
      { href: "/remote-jobs", label: "International remote jobs" },
      { href: "/skills/react", label: "Remote React jobs" },
      { href: "/skills/python", label: "Remote Python jobs" },
      { href: "/it-jobs-nepal", label: "IT jobs Nepal" },
      { href: "/blog/remote-jobs-nepal", label: "Remote jobs guide" },
    ],
  },
  "jobs-in-kathmandu": {
    slug: "jobs-in-kathmandu",
    title: "Jobs in Kathmandu | Latest Job Vacancy in Kathmandu",
    description:
      "Find job vacancy in Kathmandu from top Nepali job portals. Browse IT, banking, marketing, NGO, hospitality, and internship opportunities.",
    h1: "Jobs in Kathmandu",
    keyword: "job vacancy in kathmandu",
    filter: { type: "job", location: "Kathmandu" },
    intro: [
      "Kathmandu is Nepal's largest employment market and the first place many candidates search for new roles. KamKhoj brings together jobs in Kathmandu from multiple Nepali portals, making it easier to compare vacancies across IT, banking, finance, marketing, education, NGO, hospitality, sales, customer service, and administration.",
      "Because many employers in Kathmandu receive a high number of applications, candidates should apply early and tailor their CV to the role. Search by location and category, but also try specific keywords such as frontend developer, accountant, banking, digital marketing, operations officer, graphic designer, or internship. These searches can reveal opportunities that broad Kathmandu job pages miss.",
      "KamKhoj links each listing to the original source for final details and application. Check deadlines, office location, work mode, salary if available, and company requirements before applying. If you are open to nearby areas, also explore Lalitpur and Bhaktapur searches, because many Kathmandu Valley employers list jobs under different city names even when commuting distance is similar.",
    ],
    faqs: [
      { question: "What jobs are common in Kathmandu?", answer: "IT, banking, education, NGO, marketing, hospitality, retail, finance, and administration roles are common in Kathmandu." },
      { question: "How do I find latest job vacancy in Kathmandu?", answer: "Use KamKhoj filters for Kathmandu and sort by latest listings or search specific job titles." },
      { question: "Should I also search Lalitpur jobs?", answer: "Yes. Many Kathmandu Valley opportunities are listed under Lalitpur, Bhaktapur, or company office areas." },
    ],
    related: [
      { href: "/jobs/kathmandu", label: "Programmatic Kathmandu jobs" },
      { href: "/internships-in-nepal", label: "Internships in Kathmandu" },
      { href: "/it-jobs-nepal", label: "IT jobs Kathmandu" },
      { href: "/banking-jobs-nepal", label: "Banking jobs Nepal" },
      { href: "/jobs", label: "All jobs" },
    ],
  },
  "jobs-in-pokhara": {
    slug: "jobs-in-pokhara",
    title: "Jobs in Pokhara | Latest Vacancies and Internships",
    description:
      "Search jobs in Pokhara including hospitality, tourism, sales, education, IT, administration, and internship opportunities.",
    h1: "Jobs in Pokhara",
    keyword: "jobs in pokhara",
    filter: { type: "job", location: "Pokhara" },
    intro: [
      "Pokhara has a distinct job market shaped by tourism, hospitality, education, retail, local business, NGOs, and a growing digital-services sector. KamKhoj helps candidates search jobs in Pokhara from multiple Nepali job sources so they can find vacancies without checking every portal manually.",
      "Candidates in Pokhara should search by role, industry, and skill. Hospitality and tourism roles may use titles such as front desk, reservations, operations, guide, sales, chef, or hotel manager. Office roles may appear under administration, accounting, marketing, customer service, education, or program assistant. Technology candidates should also search for remote jobs and skill pages because some employers hire Nepal-based talent without requiring Kathmandu relocation.",
      "Every listing should be verified on the original source before applying. Review location, shift requirements, salary information, deadline, and employer details carefully. If you are willing to relocate or work remotely, combine Pokhara searches with national pages such as jobs in Nepal, IT jobs Nepal, internships in Nepal, and remote jobs Nepal.",
    ],
    faqs: [
      { question: "Which industries hire in Pokhara?", answer: "Hospitality, tourism, education, retail, services, NGOs, and some IT or remote teams commonly hire in Pokhara." },
      { question: "Can I find internships in Pokhara?", answer: "Yes, internship listings may appear in Pokhara depending on employer postings and source availability." },
      { question: "Should Pokhara candidates search remote jobs too?", answer: "Yes. Remote listings can expand options beyond local office-based roles." },
    ],
    related: [
      { href: "/jobs/pokhara", label: "Programmatic Pokhara jobs" },
      { href: "/remote-jobs-nepal", label: "Remote jobs Nepal" },
      { href: "/marketing-jobs-nepal", label: "Marketing jobs Nepal" },
      { href: "/internships-in-nepal", label: "Internships in Nepal" },
      { href: "/jobs-in-nepal", label: "Jobs in Nepal" },
    ],
  },
  "banking-jobs-nepal": {
    slug: "banking-jobs-nepal",
    title: "Banking Jobs Nepal | Latest Bank Vacancies and Finance Jobs",
    description:
      "Find banking jobs Nepal candidates can apply for, including bank vacancies, finance, accounting, teller, credit, and relationship roles.",
    h1: "Banking Jobs Nepal",
    keyword: "banking jobs nepal",
    filter: { type: "job", search: "banking" },
    intro: [
      "Banking jobs Nepal searches include commercial banks, development banks, microfinance institutions, cooperatives, insurance companies, fintech teams, and finance departments. KamKhoj aggregates relevant vacancies from multiple Nepali job sources so candidates can discover openings for teller, relationship officer, credit, branch operations, accounting, risk, audit, compliance, and finance roles.",
      "Banking and finance hiring often has strict eligibility requirements. Candidates should carefully review education level, experience, location, age limits if stated, exam or interview process, and document requirements on the original job page. For entry-level banking roles, accuracy, communication skills, customer service, Excel ability, and knowledge of basic finance concepts can be important. For experienced roles, sector knowledge, portfolio quality, and regulatory familiarity matter more.",
      "Use KamKhoj to monitor fresh vacancies and compare deadlines, then apply through the original portal or employer source. It can also help to search related terms such as finance, accountant, audit, credit, teller, branch manager, and relationship manager because employers do not always use the word banking in the title.",
    ],
    faqs: [
      { question: "Where can I find latest bank vacancies in Nepal?", answer: "KamKhoj aggregates banking and finance vacancies from multiple Nepali job portals and links to original sources." },
      { question: "What roles are included in banking jobs?", answer: "Common roles include teller, relationship officer, credit officer, branch operations, accounting, risk, audit, and compliance." },
      { question: "Do banking jobs have deadlines?", answer: "Most banking vacancies have deadlines, so candidates should verify dates on the original job post before applying." },
    ],
    related: [
      { href: "/jobs?search=finance", label: "Finance jobs" },
      { href: "/jobs?search=accountant", label: "Accounting jobs" },
      { href: "/jobs-in-kathmandu", label: "Jobs in Kathmandu" },
      { href: "/jobs-in-nepal", label: "Latest jobs in Nepal" },
      { href: "/blog/resume-writing-tips-nepal", label: "Resume tips" },
    ],
  },
  "marketing-jobs-nepal": {
    slug: "marketing-jobs-nepal",
    title: "Marketing Jobs Nepal | Digital Marketing, Sales and Brand Roles",
    description:
      "Find marketing jobs Nepal candidates can apply for, including digital marketing, SEO, content, social media, sales, and brand roles.",
    h1: "Marketing Jobs Nepal",
    keyword: "marketing jobs nepal",
    filter: { type: "job", search: "marketing" },
    intro: [
      "Marketing jobs Nepal now cover a wide range of roles, from traditional sales and brand management to digital marketing, SEO, social media, content, performance ads, email marketing, and growth roles. KamKhoj collects marketing vacancies from multiple Nepali job portals so candidates can compare openings by company, location, deadline, and source.",
      "Candidates should search beyond the word marketing. Employers may publish related roles as sales executive, business development officer, content writer, SEO specialist, social media manager, digital marketing officer, brand executive, communications officer, or growth associate. Building a focused portfolio with campaign examples, content samples, analytics results, or sales achievements can improve application quality.",
      "Before applying, verify whether the role is field-based, office-based, hybrid, or remote. Marketing jobs can vary significantly in targets, travel requirements, salary structure, incentives, and reporting expectations. KamKhoj helps with discovery and internal linking to relevant pages, while the original source remains the place to confirm final details and submit the application.",
    ],
    faqs: [
      { question: "What marketing jobs are common in Nepal?", answer: "Digital marketing, sales, content, SEO, social media, communications, and brand roles are common." },
      { question: "Do marketing jobs require experience?", answer: "Some entry-level roles accept freshers, while specialist roles usually require campaign or portfolio experience." },
      { question: "How can I find digital marketing jobs?", answer: "Search marketing, digital marketing, SEO, content, social media, and performance marketing keywords on KamKhoj." },
    ],
    related: [
      { href: "/jobs?search=digital%20marketing", label: "Digital marketing jobs" },
      { href: "/jobs?search=sales", label: "Sales jobs" },
      { href: "/skills/seo", label: "SEO jobs Nepal" },
      { href: "/jobs-in-kathmandu", label: "Marketing jobs Kathmandu" },
      { href: "/jobs-in-nepal", label: "All jobs in Nepal" },
    ],
  },
};

export const landingPageSlugs = Object.keys(seoLandingPages);

/** Keep thin/empty landing pages out of search indexes while preserving discovery links. */
export async function getLandingPageRobots(config: SeoLandingPageConfig): Promise<Metadata["robots"]> {
  try {
    const { total } = await getJobs({ ...config.filter, limit: 1 });
    return total >= 10 ? { index: true, follow: true } : { index: false, follow: true };
  } catch {
    // A temporary database failure should not make a page look authoritative.
    return { index: false, follow: true };
  }
}
import type { Metadata } from "next";
import { getJobs } from "@/server/services/data-fetching";
