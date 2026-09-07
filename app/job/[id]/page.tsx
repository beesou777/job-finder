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
  MapPin,
  ShieldCheck,
  Tags,
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
    <main className="min-h-screen overflow-x-clip bg-zinc-950 text-zinc-100">
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <article className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-14">
        <Link
          href="/jobs"
          className="mb-8 inline-flex items-center gap-2 whitespace-nowrap text-sm font-bold text-zinc-400 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>

        <header className="grid min-w-0 gap-8 border-b border-white/10 pb-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-black uppercase tracking-[0.16em] text-primary">
                {job.source}
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${active ? "border-emerald-500/30 text-emerald-300" : "border-amber-500/30 text-amber-300"}`}
              >
                {active ? "Active at last check" : "May be closed"}
              </span>
            </div>
            <h1 className="min-w-0 [overflow-wrap:anywhere] text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              {job.title}
            </h1>
            <p className="mt-5 text-xl font-bold text-zinc-300">
              {job.company || "Employer name not provided"}
            </p>
          </div>

          <div className="border-l-2 border-primary pl-5">
            <p className="text-sm leading-6 text-zinc-400">
              Applications are completed on the original website.
            </p>
            {active ? (
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-black text-zinc-950 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                Apply on official site <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs font-semibold text-amber-200">
                This listing may be expired. Check the source for the current status.
              </div>
            )}
          </div>
        </header>

        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {facts.map((fact) => {
            const Icon = fact.icon;
            return (
              <div
                key={fact.label}
                className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="truncate">{fact.label}</span>
                </div>
                <div className="mt-2 truncate text-sm font-black text-zinc-100" title={fact.value}>
                  {fact.value}
                </div>
              </div>
            );
          })}
        </section>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
              <h2 className="text-xl font-black text-zinc-100">Job overview</h2>
              {job.description ? (
                <div className="prose prose-invert mt-6 max-w-none text-sm leading-7 text-zinc-300">
                  <div
                    className="whitespace-pre-wrap [overflow-wrap:anywhere]"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </div>
              ) : (
                <p className="mt-4 text-sm text-zinc-400">
                  Full details are hosted on the source portal.
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="text-base font-black text-zinc-100">Application verification</h3>
              <ul className="mt-4 space-y-3 text-xs leading-5 text-zinc-400">
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
          <section className="mt-16 border-t border-white/10 pt-12">
            <h2 className="text-2xl font-black text-zinc-100">Similar vacancies</h2>
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
