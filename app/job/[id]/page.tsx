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
import { getDataSource } from "@/lib/db";
import { Job } from "@/server/db/entities/Job";
import { absoluteUrl } from "@/lib/site";
import { generateJobPostingSchema } from "@/lib/seo";
import { JobCard } from "@/components/JobCard";

const getJob = cache(async (id: string) => {
  const dataSource = await getDataSource();
  return dataSource.getRepository(Job).findOne({ where: { id }, relations: { category: true } });
});

function hasMeaningfulDescription(description?: string | null) {
  return Boolean(description && description.replace(/\s+/g, " ").trim().length >= 160);
}

const getRelatedJobs = cache(async (job: Job) => {
  const repository = (await getDataSource()).getRepository(Job);
  const now = new Date();
  let query = repository
    .createQueryBuilder("related")
    .leftJoin("related.category", "category")
    .select([
      "related.id",
      "related.title",
      "related.company",
      "related.location",
      "related.applyUrl",
      "related.type",
      "related.createdAt",
      "related.postedAt",
      "related.expiresAt",
      "related.deadline",
      "related.lastVerifiedAt",
      "related.deadlineConfidence",
      "related.salaryText",
      "related.jobType",
      "related.source",
      "category.id",
      "category.name",
      "category.slug",
    ])
    .where("related.id != :id", { id: job.id })
    .andWhere("related.isActive = true")
    .andWhere("(related.expiresAt IS NULL OR related.expiresAt > :now)", { now });

  if (job.categoryId)
    query = query.andWhere("related.categoryId = :categoryId", { categoryId: job.categoryId });
  else if (job.location)
    query = query.andWhere("related.location ILIKE :location", { location: `%${job.location}%` });
  else query = query.andWhere("related.type = :type", { type: job.type });

  return query.orderBy("related.postedAt", "DESC", "NULLS LAST").take(3).getMany();
});

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const job = await getJob(params.id);
  if (!job) return { title: "Job not found", robots: { index: false, follow: true } };
  const active = job.isActive && (!job.expiresAt || job.expiresAt > new Date());
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
  const active = job.isActive && (!job.expiresAt || job.expiresAt > now);
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
      ? { label: "Apply by", value: job.expiresAt.toLocaleDateString(), icon: CalendarDays }
      : null,
    job.postedAt
      ? { label: "Listed", value: job.postedAt.toLocaleDateString(), icon: Clock3 }
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
                href={`/apply/${job.id}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-5 font-black text-zinc-950 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Check full listing <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <p className="mt-4 text-sm font-bold text-amber-300">Applications may be closed.</p>
            )}
          </div>
        </header>

        {facts.length > 0 && (
          <section
            aria-label="Job facts"
            className="grid border-b border-white/10 sm:grid-cols-2 lg:grid-cols-3"
          >
            {facts.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex min-w-0 gap-3 border-white/10 py-5 sm:border-r sm:px-5 sm:first:pl-0"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    {label}
                  </p>
                  <p className="mt-1 break-words font-bold text-zinc-200">{value}</p>
                </div>
              </div>
            ))}
          </section>
        )}

        <nav aria-label="Related job searches" className="border-b border-white/10 py-6">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Explore related searches
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold">
            {job.category?.slug && (
              <Link
                href={`/jobs/category/${job.category.slug}`}
                className="rounded-full border border-white/10 px-4 py-2 text-zinc-300 hover:border-primary hover:text-primary"
              >
                {job.category.name} jobs
              </Link>
            )}
            {job.location && (
              <Link
                href={`/jobs?location=${encodeURIComponent(job.location)}`}
                className="rounded-full border border-white/10 px-4 py-2 text-zinc-300 hover:border-primary hover:text-primary"
              >
                Jobs in {job.location}
              </Link>
            )}
            {job.type === "internship" && (
              <Link
                href="/internships-in-nepal"
                className="rounded-full border border-white/10 px-4 py-2 text-zinc-300 hover:border-primary hover:text-primary"
              >
                Nepal internships
              </Link>
            )}
            {(job.jobType === "remote" || job.jobType === "hybrid") && (
              <Link
                href="/remote-jobs-nepal"
                className="rounded-full border border-white/10 px-4 py-2 text-zinc-300 hover:border-primary hover:text-primary"
              >
                Remote jobs in Nepal
              </Link>
            )}
            {job.category?.name && /it|software|developer|technology/i.test(job.category.name) && (
              <Link
                href="/blog/it-jobs-nepal"
                className="rounded-full border border-white/10 px-4 py-2 text-zinc-300 hover:border-primary hover:text-primary"
              >
                IT career guide
              </Link>
            )}
            <Link
              href="/blog/interview-tips-nepal"
              className="rounded-full border border-white/10 px-4 py-2 text-zinc-300 hover:border-primary hover:text-primary"
            >
              Interview tips
            </Link>
          </div>
        </nav>

        <section className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            {completeDescription ? (
              <>
                <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-primary">
                  From the source
                </p>
                <h2 className="mt-2 text-2xl font-black">Role details</h2>
                <div className="mt-6 whitespace-pre-wrap break-words text-base leading-8 text-zinc-300">
                  {job.description}
                </div>
                {job.requirements && (
                  <>
                    <h2 className="mt-10 text-2xl font-black">Requirements</h2>
                    <div className="mt-5 whitespace-pre-wrap break-words text-base leading-8 text-zinc-300">
                      {job.requirements}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="border-y border-white/10 py-8">
                <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-amber-300">
                  Limited source data
                </p>
                <h2 className="mt-3 max-w-xl text-2xl font-black">
                  The full description is only available on the original listing.
                </h2>
                <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
                  We have kept the verified facts above instead of guessing responsibilities,
                  qualifications, or salary. Open the source to review the complete vacancy notice
                  before applying.
                </p>
                {active && (
                  <a
                    href={`/apply/${job.id}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="mt-6 inline-flex items-center gap-2 whitespace-nowrap font-black text-primary hover:text-white"
                  >
                    Read complete details <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          <aside className="h-fit border-t-2 border-primary bg-zinc-900 p-6">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h2 className="mt-4 text-lg font-black">Verify before applying</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-400">
              <li>Confirm the deadline and requirements on {job.source}.</li>
              <li>Never pay an application or interview fee.</li>
              <li>Check the employer and recruiter contact details.</li>
            </ul>
            <div className="mt-6 border-t border-white/10 pt-5 text-sm text-zinc-400">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                {job.lastVerifiedAt
                  ? `Checked ${job.lastVerifiedAt.toLocaleDateString()} at ${job.lastVerifiedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "Verification time unavailable"}
              </p>
            </div>
          </aside>
        </section>

        {relatedJobs.length > 0 && (
          <section className="border-t border-white/10 py-12">
            <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-primary">
              Keep exploring
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-3xl font-black">Related active jobs</h2>
              <Link
                href="/jobs"
                className="whitespace-nowrap text-sm font-black text-zinc-300 hover:text-primary"
              >
                Browse all jobs →
              </Link>
            </div>
            <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {relatedJobs.map((related) => (
                <JobCard key={related.id} job={related as any} />
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
