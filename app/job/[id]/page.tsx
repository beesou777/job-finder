import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, CalendarDays, CheckCircle2, ExternalLink, MapPin } from "lucide-react";
import { getDataSource } from "@/lib/db";
import { Job } from "@/entities/Job";
import { absoluteUrl } from "@/lib/site";
import { generateJobPostingSchema } from "@/lib/seo";

async function getJob(id: string) {
  const dataSource = await getDataSource();
  return dataSource.getRepository(Job).findOne({ where: { id }, relations: { category: true } });
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const job = await getJob(params.id);
  if (!job) return { title: "Job not found", robots: { index: false, follow: true } };
  const active = job.isActive && (!job.expiresAt || job.expiresAt > new Date());
  return {
    title: `${job.title}${job.company ? ` at ${job.company}` : ""}`,
    description: (job.description || `${job.title}${job.company ? ` at ${job.company}` : ""}${job.location ? ` in ${job.location}` : ""}.`).replace(/\s+/g, " ").slice(0, 155),
    alternates: { canonical: absoluteUrl(`/job/${job.id}`) },
    robots: active ? undefined : { index: false, follow: true },
  };
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await getJob(params.id);
  if (!job) notFound();

  const now = new Date();
  const active = job.isActive && (!job.expiresAt || job.expiresAt > now);
  const schema = active ? generateJobPostingSchema({
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
  }) : null;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />}
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-16">
        <Link href="/jobs" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>

        <header className="border-b border-white/10 pb-8">
          <p className="mb-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-primary">{job.source} listing</p>
          <h1 className="text-3xl font-black leading-tight sm:text-5xl">{job.title}</h1>
          <p className="mt-4 text-xl font-bold text-zinc-300">{job.company || "Company not provided"}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-zinc-300">
            {job.location && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{job.location}</span>}
            {job.jobType && <span className="inline-flex items-center gap-2"><Briefcase className="h-4 w-4" />{job.jobType}</span>}
            {job.expiresAt && <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />Apply by {job.expiresAt.toLocaleDateString()}</span>}
          </div>
        </header>

        <section className={`my-8 rounded-xl border p-5 ${active ? "border-emerald-500/30 bg-emerald-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
          <p className="flex items-center gap-2 font-black"><CheckCircle2 className="h-5 w-5" />{active ? "This listing was active at the last check" : "This listing is no longer shown as active"}</p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {job.lastVerifiedAt ? `Last checked against ${job.source} on ${job.lastVerifiedAt.toLocaleString()}.` : "Verification date is not available for this older listing."}
            {!job.expiresAt && active ? " The employer did not provide a confirmed deadline, so check the original listing before applying." : ""}
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-black">Job description</h2>
              <div className="mt-4 whitespace-pre-wrap text-base leading-8 text-zinc-300">{job.description || "The source did not provide a full job description. Review the original listing for complete details."}</div>
            </section>
            {job.requirements && <section><h2 className="text-xl font-black">Requirements</h2><div className="mt-4 whitespace-pre-wrap text-base leading-8 text-zinc-300">{job.requirements}</div></section>}
          </div>

          <aside className="h-fit rounded-xl border border-white/10 bg-zinc-900 p-5">
            <h2 className="font-black">Before you apply</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
              <li>Confirm the deadline on the original source.</li>
              <li>Never pay an application or interview fee.</li>
              <li>Verify recruiter emails and company details.</li>
            </ul>
            {active ? <a href={`/apply/${job.id}`} target="_blank" rel="noopener noreferrer nofollow" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-black text-zinc-950 hover:bg-white">View original listing <ExternalLink className="h-4 w-4" /></a> : <p className="mt-5 text-sm font-bold text-amber-300">Applications may be closed.</p>}
          </aside>
        </div>
      </article>
    </main>
  );
}
