/* Hallmark · genre: modern-minimal · macrostructure: Verified Job Brief · tone: direct/trustworthy
 * pre-emit critique: P5 H5 E4 S5 R5 V4 · contrast: pass · responsive: pass
 */
import { cache } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  ListChecks,
  MapPin,
  ShieldCheck,
  Tags,
  UserRound,
} from "lucide-react";
import { absoluteUrl } from "@/lib/site";
import { generateJobPostingSchema } from "@/lib/seo";
import { JobCard } from "@/components/JobCard";
import { getJobById, getJobs } from "@/server/services/data-fetching";

const getJob = cache(async (id: string) => {
  return getJobById(id);
});

function hasMeaningfulDescription(description?: string | null) {
  return Boolean(description && description.replace(/\s+/g, " ").trim().length >= 160);
}

type DescriptionSection = {
  title: string;
  paragraphs: string[];
  bullets: string[];
};

function getDescriptionSections(description?: string | null): DescriptionSection[] {
  const source = (description || "")
    .replace(/<br\s*\/?>(?=\S)/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\r/g, "")
    .trim();

  const sections: DescriptionSection[] = [];
  let current: DescriptionSection = { title: "Job overview", paragraphs: [], bullets: [] };
  const headingPattern =
    /^(about (the )?role|job summary|job overview|responsibilities|key responsibilities|requirements|qualifications|skills|what you.?ll do|what you.?ll need|application process|how to apply)\s*:?[.]?$/i;

  const commit = () => {
    if (current.paragraphs.length || current.bullets.length) sections.push(current);
  };

  source
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .forEach((line) => {
      const heading = line.replace(/^#+\s*/, "").match(headingPattern);
      if (heading) {
        commit();
        current = { title: heading[1].replace(/\s*:/, ""), paragraphs: [], bullets: [] };
      } else if (/^(?:[-•*]|\d+[.)])\s+/.test(line)) {
        current.bullets.push(line.replace(/^(?:[-•*]|\d+[.)])\s+/, ""));
      } else {
        current.paragraphs.push(line);
      }
    });

  commit();
  return sections.length > 0
    ? sections
    : [
        {
          title: "Job overview",
          paragraphs: [source || "Full details are hosted on the original source portal."],
          bullets: [],
        },
      ];
}

function DescriptionSectionCard({ section }: { section: DescriptionSection }) {
  const SectionIcon = /responsibil|what you.?ll do/i.test(section.title)
    ? ListChecks
    : /require|qualif|skill|what you.?ll need/i.test(section.title)
      ? UserRound
      : FileText;

  return (
    <section className="rounded-3xl border border-[#dce8f7] bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff7ff] text-primary">
          <SectionIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-black text-[#102e67]">{section.title}</h2>
          <div className="mt-4 space-y-3 text-[15px] leading-7 text-[#536b91]">
            {section.paragraphs.map((paragraph, index) => (
              <p key={`${section.title}-paragraph-${index}`}>{paragraph}</p>
            ))}
            {section.bullets.length > 0 && (
              <ul className="space-y-2 pl-5 text-[#334f7d] marker:text-primary">
                {section.bullets.map((bullet, index) => (
                  <li key={`${section.title}-bullet-${index}`} className="pl-1">
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const getRelatedJobs = cache(async (job: any) => {
  const { jobs } = await getJobs({
    categoryId: job.categoryId || job.category?.id,
    location: job.location,
    limit: 6,
  });
  return (jobs || []).filter((item: any) => item.id !== job.id).slice(0, 3);
});

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const job = await getJob(params.id);
  if (!job) return { title: "Job not found", robots: { index: false, follow: true } };
  const active = job.isActive && (!job.expiresAt || new Date(job.expiresAt) > new Date());
  const indexable = active && hasMeaningfulDescription(job.description);
  return {
    title: `${job.title}${job.company ? ` at ${job.company}` : ""}`,
    description: (
      job.description ||
      `${job.title}${job.company ? ` at ${job.company}` : ""}${job.location ? ` in ${job.location}` : ""}. Verify complete details on the original source.`
    )
      .replace(/\s+/g, " ")
      .slice(0, 155),
    alternates: { canonical: absoluteUrl(`/job/${job.id}`) },
    robots: indexable ? undefined : { index: false, follow: true },
  };
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await getJob(params.id);
  if (!job) notFound();

  const now = new Date();
  const active = job.isActive && (!job.expiresAt || new Date(job.expiresAt) > now);
  const completeDescription = hasMeaningfulDescription(job.description);
  const descriptionSections = getDescriptionSections(job.description);
  const relatedJobs = await getRelatedJobs(job);
  const schema =
    active && completeDescription
      ? generateJobPostingSchema({
          id: job.id,
          title: job.title,
          description: job.description,
          company: job.company,
          location: job.location,
          salaryText: job.salaryText,
          deadline: job.deadline,
          createdAt: job.postedAt || job.createdAt,
          expiresAt: job.expiresAt,
          applyUrl: job.applyUrl,
          type: job.jobType || job.type,
        })
      : null;

  const facts = [
    job.location ? { label: "Location", value: job.location, icon: MapPin } : null,
    job.jobType ? { label: "Work type", value: job.jobType, icon: Briefcase } : null,
    job.category?.name ? { label: "Category", value: job.category.name, icon: Tags } : null,
    job.salaryText && !/negotiable/i.test(job.salaryText)
      ? { label: "Salary", value: job.salaryText, icon: Banknote }
      : null,
    job.expiresAt
      ? {
          label: "Apply by",
          value: new Date(job.expiresAt).toLocaleDateString(),
          icon: CalendarDays,
        }
      : null,
    job.postedAt
      ? { label: "Listed", value: new Date(job.postedAt).toLocaleDateString(), icon: Clock3 }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string; icon: typeof MapPin }>;

  return (
    <main className="public-detail-surface min-h-screen overflow-x-clip bg-[#f9fafb] text-[#102e67]">
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <article className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:py-9">
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-2 whitespace-nowrap text-sm font-bold text-[#617493] hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>

        <header className="grid min-w-0 gap-7 border-b border-[#dce8f7] pb-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-black uppercase tracking-[0.16em] text-primary">
                {job.source}
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}
              >
                {active ? "Active at last check" : "May be closed"}
              </span>
            </div>
            <h1 className="min-w-0 max-w-2xl [overflow-wrap:anywhere] text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
              {job.title}
            </h1>
            <p className="mt-5 text-xl font-bold text-[#334f7d]">
              {job.company || "Employer name not provided"}
            </p>
          </div>

          <div className="rounded-2xl border border-primary/15 bg-white/85 p-5 shadow-sm backdrop-blur-sm lg:border-l-2 lg:pl-5">
            <p className="text-sm leading-6 text-[#617493]">
              Applications are completed on the original website.
            </p>
            {active ? (
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-black text-white transition hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                Apply on official site <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-700">
                This listing may be expired. Check the source for the current status.
              </div>
            )}
          </div>
        </header>

        <section className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {facts.map((fact) => {
            const Icon = fact.icon;
            return (
              <div
                key={fact.label}
                className="min-w-0 rounded-2xl border border-[#dce8f7] bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#617493]">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="truncate">{fact.label}</span>
                </div>
                <div className="mt-2 truncate text-sm font-black text-[#102e67]" title={fact.value}>
                  {fact.value}
                </div>
              </div>
            );
          })}
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <div className="space-y-5">
              {descriptionSections.map((section, index) => (
                <DescriptionSectionCard key={`${section.title}-${index}`} section={section} />
              ))}
              <div className="rounded-2xl border border-primary/15 bg-[#eff7ff] p-5 text-sm leading-6 text-[#536b91]">
                <p className="font-bold text-[#102e67]">
                  Applications are completed on the original employer website.
                </p>
                <p className="mt-1">
                  Review the full listing and confirm eligibility, salary, and application
                  instructions before applying.
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-[#dce8f7] bg-white p-6 shadow-sm">
              <h3 className="text-base font-black text-[#102e67]">Application verification</h3>
              <ul className="mt-4 space-y-3 text-xs leading-5 text-[#617493]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>Aggregated directly from Nepali employer career pages and job boards.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>KamKhoj never charges application fees or asks for bank details.</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {relatedJobs.length > 0 && (
          <section className="mt-12 border-t border-[#dce8f7] pt-10">
            <h2 className="text-2xl font-black text-[#102e67]">Similar vacancies</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedJobs.map((related: any) => (
                <JobCard key={related.id} job={related} />
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
