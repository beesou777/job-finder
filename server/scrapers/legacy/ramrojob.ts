import axios from "axios";
import { JobResult, JobSchema } from "@/server/services/types";

const API_BASE = "https://www.ramrojob.com/advance_search";

interface RamroJobOrganization {
  organization_name: string;
  city?: string;
  district?: string;
}

interface RamroJobItem {
  id: number;
  job_title: string;
  job_slug: string;
  deadline: string;
  organization: RamroJobOrganization;
}

interface RamroJobAPIResponse {
  data: RamroJobItem[];
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  total: number;
}

export async function scrapeRamroJob(): Promise<JobResult[]> {
  try {
    const allJobs: JobResult[] = [];
    let currentPage = 1;
    let lastPage = 1;

    // Fetch all pages
    do {
      try {
        const response = await axios.get<RamroJobAPIResponse>(`${API_BASE}?page=${currentPage}`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 15000,
        });

        if (response.data?.data && Array.isArray(response.data.data)) {
          // Filter out expired jobs and map to JobResult
          const now = new Date();
          const totalJobs = response.data.data.length;
          let expiredCount = 0;

          for (const job of response.data.data) {
            // Skip expired jobs
            if (job.deadline) {
              const deadlineDate = new Date(job.deadline);
              if (deadlineDate <= now) {
                expiredCount++;
                continue; // Skip this job as it's expired
              }
            }

            const location = job.organization?.city || job.organization?.district || "Nepal";
            const url = `https://www.ramrojob.com/${job.job_slug}`;

            const result = JobSchema.safeParse({
              title: job.job_title,
              company: job.organization?.organization_name || "Not specified",
              location: location,
              url: url,
              source: "ramrojob",
            });

            if (result.success) {
              allJobs.push(result.data);
            }
          }

          if (expiredCount > 0) {
            console.log(
              `RamroJob: Filtered out ${expiredCount} expired job(s) on page ${currentPage}`,
            );
          }

          // Update pagination info
          lastPage = response.data.last_page || 1;
          currentPage = response.data.current_page || currentPage;
        } else {
          break;
        }

        // Check if there's a next page
        if (currentPage >= lastPage || !response.data.next_page_url) {
          break;
        }

        currentPage++;

        // Add small delay between requests
        if (currentPage <= lastPage) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (pageError: any) {
        console.error(`Error fetching RamroJob page ${currentPage}:`, pageError.message);
        break;
      }
    } while (currentPage <= lastPage);

    console.log(`✅ RamroJob: Fetched ${allJobs.length} jobs from API`);
    return allJobs;
  } catch (error: any) {
    console.error("❌ RamroJob API failed:", error.message);
    return [];
  }
}
