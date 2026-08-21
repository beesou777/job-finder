import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { MapPin } from "lucide-react";
import { JobsList, JobsSkeleton } from "@/components/jobs/JobsList";
import { generateCollectionMetadata } from "@/lib/seo";
import { absoluteUrl, isUuid, titleCaseSlug } from "@/lib/site";
import { getDataSource } from "@/lib/db";
import { Job } from "@/server/db/entities/Job";
import { addUtmParams } from "@/lib/utils";

const knownLocations = [
  "kathmandu",
  "pokhara",
  "lalitpur",
  "bhaktapur",
  "butwal",
  "biratnagar",
  "chitwan",
  "remote",
];

export const revalidate = 300;

export function generateStaticParams() {
  return knownLocations.map((location) => ({ location }));
}

export async function generateMetadata({
  params,
}: {
  params: { location: string };
}): Promise<Metadata> {
  if (isUuid(params.location)) {
    return { title: "Apply for Job | KamKhoj", robots: { index: false, follow: true } };
  }

  const locationName = titleCaseSlug(params.location);
  const metadata = generateCollectionMetadata({
    path: `/jobs/${params.location}`,
    title: `Jobs in ${locationName}, Nepal | Latest Vacancies | KamKhoj`,
    description: `Find latest jobs in ${locationName}, Nepal. Browse vacancies by company, category, skills, and source from major Nepali job portals.`,
    keywords: [
      `jobs in ${locationName.toLowerCase()}`,
      `${locationName.toLowerCase()} jobs nepal`,
      "vacancy in nepal",
    ],
  });
  return {
    ...metadata,
    robots: { index: false, follow: true },
  };
}

export default async function LocationSlugPage({
  params,
  searchParams,
}: {
  params: { location: string };
  searchParams: { page?: string };
}) {
  if (isUuid(params.location)) {
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);
    const job = await jobRepository.findOne({ where: { id: params.location } });
    redirect(job ? addUtmParams(job.applyUrl, job.source, job.id) : "/jobs");
  }

  const locationName = titleCaseSlug(params.location);
  const page = Number(searchParams.page || 1);

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(184,244,96,0.12),transparent_32%)]">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <nav className="mb-8 text-sm font-bold text-zinc-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/jobs" className="hover:text-primary">
              Jobs
            </Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-200">{locationName}</span>
          </nav>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-primary">
            Location jobs
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-zinc-50 mb-4">
            Jobs in {locationName}, Nepal
          </h1>
          <p className="text-lg text-zinc-400 max-w-3xl leading-8">
            Browse current job vacancies in {locationName}. Compare companies, categories, sources,
            and deadlines from Nepali job portals in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              [`/jobs?location=${encodeURIComponent(locationName)}`, "Filtered jobs"],
              ["/it-jobs-nepal", "IT jobs"],
              ["/internships-in-nepal", "Internships"],
              ["/remote-jobs-nepal", "Remote jobs"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-zinc-200 hover:border-primary/60 hover:text-primary"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-2 text-zinc-400">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-black text-zinc-50">Latest {locationName} jobs</h2>
        </div>
        <Suspense fallback={<JobsSkeleton />}>
          <JobsList page={page} type="job" location={locationName} />
        </Suspense>
      </section>
    </div>
  );
}
