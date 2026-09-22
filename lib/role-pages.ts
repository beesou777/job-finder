import type { SeoLandingPageConfig } from "@/lib/seo-pages";

const configuredMinimum = Number(process.env.SEO_MIN_ACTIVE_JOBS || 5);
export const SEO_MIN_ACTIVE_JOBS = Number.isFinite(configuredMinimum)
  ? Math.max(1, configuredMinimum)
  : 5;

export const roleLandingPages: Record<string, SeoLandingPageConfig> = {
  "frontend-developer": {
    slug: "frontend-developer",
    path: "/roles/frontend-developer",
    title: "Frontend Developer Jobs in Nepal",
    description:
      "Find frontend developer jobs in Nepal, including web interface, JavaScript, React, and UI engineering vacancies from public job sources.",
    h1: "Frontend Developer Jobs in Nepal",
    keyword: "frontend developer jobs in Nepal",
    filter: { type: "job", search: "frontend developer" },
    intro: [
      "Frontend developer roles in Nepal can appear under several titles, including frontend engineer, web developer, UI developer, and JavaScript developer. This page groups current results around the primary frontend developer intent while keeping each employer's original job title visible.",
      "Review the original listing for the required framework, experience level, work arrangement, and application deadline. Junior candidates can strengthen applications with deployed projects and accessible source-code samples; experienced candidates should make shipped product work and measurable improvements easy to verify.",
    ],
    faqs: [
      { question: "Which skills appear in frontend developer jobs?", answer: "Listings may ask for HTML, CSS, JavaScript, TypeScript, React, testing, accessibility, or related web skills. Requirements vary by employer." },
      { question: "Where do I apply?", answer: "KamKhoj links each vacancy to its original public source, where you can verify the requirements and submit an application." },
    ],
    related: [
      { href: "/skills/react", label: "React jobs in Nepal" },
      { href: "/it-jobs-nepal", label: "IT jobs in Nepal" },
      { href: "/roles/software-engineer", label: "Software engineer jobs" },
      { href: "/jobs-in-kathmandu", label: "Jobs in Kathmandu" },
    ],
  },
  "software-engineer": {
    slug: "software-engineer",
    path: "/roles/software-engineer",
    title: "Software Engineer Jobs in Nepal",
    description:
      "Find software engineer jobs in Nepal and compare current development vacancies, locations, work modes, and original application sources.",
    h1: "Software Engineer Jobs in Nepal",
    keyword: "software engineer jobs in Nepal",
    filter: { type: "job", search: "software engineer" },
    intro: [
      "Software engineer vacancies in Nepal span product companies, service teams, startups, financial technology, and remote employers. Job titles and stacks differ, so compare the actual responsibilities rather than relying on the title alone.",
      "Use the original posting to confirm language and framework requirements, experience level, location, interview process, and deadline. KamKhoj provides discovery and source attribution; the employer or source portal controls the final application details.",
    ],
    faqs: [
      { question: "Are junior software engineer roles included?", answer: "Entry-level results appear when the source listing matches the software engineer search. Check each title and requirements for the stated level." },
      { question: "Does KamKhoj accept the application?", answer: "No. Applications continue on the original employer or job-portal page linked from each listing." },
    ],
    related: [
      { href: "/roles/frontend-developer", label: "Frontend developer jobs" },
      { href: "/skills/python", label: "Python jobs in Nepal" },
      { href: "/it-jobs-nepal", label: "IT jobs in Nepal" },
      { href: "/remote-jobs-nepal", label: "Remote jobs in Nepal" },
    ],
  },
  "data-analyst": {
    slug: "data-analyst",
    path: "/roles/data-analyst",
    title: "Data Analyst Jobs in Nepal",
    description:
      "Find data analyst jobs in Nepal and review current analytics vacancies, required tools, locations, and original application sources.",
    h1: "Data Analyst Jobs in Nepal",
    keyword: "data analyst jobs in Nepal",
    filter: { type: "job", search: "data analyst" },
    intro: [
      "Data analyst roles can sit within technology, finance, operations, research, marketing, and development organizations. Relevant listings may emphasize spreadsheets, SQL, reporting, dashboards, statistics, or business analysis depending on the team.",
      "Read the complete source listing before applying because tool requirements and domain knowledge vary substantially. Portfolio projects should explain the question, data quality work, analysis, and decision supported—not only display a chart.",
    ],
    faqs: [
      { question: "What should I verify in a data analyst listing?", answer: "Check the required tools, industry knowledge, experience level, location, work mode, and application deadline on the original source." },
      { question: "Are internships included?", answer: "This role page focuses on jobs. Use the internships page to search specifically for data and analytics internships." },
    ],
    related: [
      { href: "/skills/python", label: "Python jobs in Nepal" },
      { href: "/it-jobs-nepal", label: "IT jobs in Nepal" },
      { href: "/internships-in-nepal", label: "Internships in Nepal" },
      { href: "/jobs", label: "All current jobs" },
    ],
  },
  accountant: {
    slug: "accountant",
    path: "/roles/accountant",
    title: "Accountant Jobs in Nepal",
    description:
      "Find accountant jobs in Nepal and compare current accounting, finance, audit, and bookkeeping vacancies from public job sources.",
    h1: "Accountant Jobs in Nepal",
    keyword: "accountant jobs in Nepal",
    filter: { type: "job", search: "accountant" },
    intro: [
      "Accountant vacancies in Nepal appear across companies, banks, consultancies, schools, non-profits, and service organizations. Titles can include accountant, accounts officer, finance officer, audit assistant, or bookkeeping roles, each with different responsibilities.",
      "Confirm the required qualification, software, tax or audit knowledge, experience, office location, and deadline on the original job source. Do not assume a salary or employment term when the employer has not published it.",
    ],
    faqs: [
      { question: "Which related titles should accountants search?", answer: "Accounts officer, finance officer, audit assistant, bookkeeper, and tax-related titles may surface relevant opportunities." },
      { question: "Are salary details always available?", answer: "No. KamKhoj only displays salary information when it is available in the listing data; verify the source before applying." },
    ],
    related: [
      { href: "/banking-jobs-nepal", label: "Banking jobs in Nepal" },
      { href: "/jobs-in-kathmandu", label: "Jobs in Kathmandu" },
      { href: "/internships-in-nepal", label: "Internships in Nepal" },
      { href: "/jobs", label: "All current jobs" },
    ],
  },
};
