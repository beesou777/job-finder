type SeoJob = {
  title?: unknown;
  description?: unknown;
  company?: unknown;
  applyUrl?: unknown;
  isActive?: unknown;
  expiresAt?: unknown;
  status?: unknown;
  classification?: unknown;
  qualityStatus?: unknown;
  duplicateOfId?: unknown;
  isDuplicate?: unknown;
  qualityScore?: unknown;
};

const REJECTED_VALUES = new Set([
  "quality_rejected",
  "non_job_page",
  "rejected",
  "deleted",
  "inactive",
  "closed",
  "expired",
]);

function normalized(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function hasMeaningfulJobDescription(description: unknown) {
  if (typeof description !== "string") return false;
  const plainText = description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return plainText.length >= 160;
}

export function isActiveJob(job: SeoJob, now = new Date()) {
  if (job.isActive === false) return false;
  const status = normalized(job.status);
  if (REJECTED_VALUES.has(status)) return false;

  if (job.expiresAt) {
    const expiry = new Date(String(job.expiresAt));
    if (!Number.isNaN(expiry.getTime()) && expiry <= now) return false;
  }
  return true;
}

/**
 * Conservative indexability gate shared by job metadata, schema, and sitemap output.
 * Optional backend quality fields are honored when present without inventing a second
 * classification system in the frontend.
 */
export function isJobSeoIndexable(job: SeoJob, now = new Date()) {
  const title = typeof job.title === "string" ? job.title.trim() : "";
  const company = typeof job.company === "string" ? job.company.trim() : "";
  const applyUrl = typeof job.applyUrl === "string" ? job.applyUrl.trim() : "";
  const quality = normalized(job.qualityStatus);
  const classification = normalized(job.classification);

  if (!isActiveJob(job, now)) return false;
  if (REJECTED_VALUES.has(quality) || REJECTED_VALUES.has(classification)) return false;
  if (job.isDuplicate === true || Boolean(job.duplicateOfId)) return false;
  if (title.length < 4 || company.length < 2) return false;
  if (!hasMeaningfulJobDescription(job.description)) return false;

  try {
    const url = new URL(applyUrl);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** A lighter gate for list payloads, which intentionally omit full descriptions. */
export function isJobSitemapCandidate(job: SeoJob, now = new Date()) {
  const title = typeof job.title === "string" ? job.title.trim() : "";
  const company = typeof job.company === "string" ? job.company.trim() : "";
  const applyUrl = typeof job.applyUrl === "string" ? job.applyUrl.trim() : "";
  const quality = normalized(job.qualityStatus);
  const classification = normalized(job.classification);
  const qualityScore = typeof job.qualityScore === "number" ? job.qualityScore : null;

  if (!isActiveJob(job, now)) return false;
  if (REJECTED_VALUES.has(quality) || REJECTED_VALUES.has(classification)) return false;
  if (job.isDuplicate === true || Boolean(job.duplicateOfId)) return false;
  if (qualityScore !== null && qualityScore < 60) return false;
  if (title.length < 4 || company.length < 2) return false;

  try {
    const url = new URL(applyUrl);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
