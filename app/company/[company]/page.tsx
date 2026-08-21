import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Building2 } from "lucide-react";
import { JobsList, JobsSkeleton } from "@/components/jobs/JobsList";
import { generateCollectionMetadata } from "@/lib/seo";
import { titleCaseSlug } from "@/lib/site";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: { company: string };
}): Promise<Metadata> {
  const companyName = titleCaseSlug(params.company);
  return {
    ...generateCollectionMetadata({
      path: `/company/${params.company}`,
      title: `${companyName} Jobs in Nepal | Careers and Vacancies | KamKhoj`,
      description: `Find latest ${companyName} jobs in Nepal. Browse active vacancies, internships, and related openings aggregated by KamKhoj.`,
      keywords: [`${companyName} jobs`, `${companyName} careers`, "company jobs nepal"],
    }),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function CompanyPage({
  params,
  searchParams,
}: {
  params: { company: string };
  searchParams: { page?: string };
}) {
  const companyName = titleCaseSlug(params.company);
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
            <span className="text-zinc-200">{companyName}</span>
          </nav>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-primary">
            Company search
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-zinc-50 mb-4">
            {companyName} Jobs in Nepal
          </h1>
          <p className="text-lg text-zinc-400 max-w-3xl leading-8">
            Browse active and related vacancies for {companyName}. KamKhoj links each job to the
            original source so candidates can verify details before applying.
          </p>
        </div>
      </section>
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-black text-zinc-50">
            Latest roles mentioning {companyName}
          </h2>
        </div>
        <Suspense fallback={<JobsSkeleton />}>
          <JobsList page={page} search={companyName} />
        </Suspense>
      </section>
    </div>
  );
}
