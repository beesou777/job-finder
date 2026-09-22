import { Suspense } from "react";
import { JobsFiltering } from "./JobsFiltering";
import { JobsList, JobsSkeleton } from "./JobsList";
import { getCategories } from "@/server/services/data-fetching";

const jobTypes = ["full-time", "part-time", "contract", "remote", "hybrid", "onsite"].map((value) => ({ value, label: value === "full-time" ? "Full-time" : value === "part-time" ? "Part-time" : value === "onsite" ? "On-site" : value[0].toUpperCase() + value.slice(1), count: 0 }));
const locations = ["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Chitwan", "Butwal", "Biratnagar", "Remote"].map((value) => ({ value, label: value, count: 0 }));

export async function JobsBrowserPage({
  page,
  filters,
  basePath = "/jobs",
  title,
  searchPlaceholder,
}: {
  page: number;
  filters: Record<string, string | undefined>;
  basePath?: string;
  title?: string;
  searchPlaceholder?: string;
}) {
  const categories = await getCategories();
  return (
    <>
      <JobsFiltering categories={categories} jobTypes={jobTypes} locations={locations} basePath={basePath} title={title} searchPlaceholder={searchPlaceholder} />
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<JobsSkeleton />}>
          <JobsList page={page} {...filters} />
        </Suspense>
      </div>
    </>
  );
}
