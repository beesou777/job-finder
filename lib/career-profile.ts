import { authFetch } from "./auth-context";

export type Experience = { title: string; organization: string; startMonth: string; endMonth: string; current: boolean; description: string };
export type Education = { qualification: string; institution: string; startMonth: string; endMonth: string; description: string };
export type CareerProfile = {
  fullName: string; phone: string; location: string; professionalTitle: string; summary: string;
  skills: string[]; languages: string[]; experience: Experience[]; education: Education[];
  projects: { name: string; description: string }[];
  links: { label: string; url: string }[];
};
export type CareerAiSettings = {
  tailorResume: boolean; coverLetter: boolean; gapQuestions: boolean;
  language: "auto" | "en" | "ne"; reviewBeforeSubmit: true; autoApply: false;
};
export type CareerProfileResponse = {
  version: number; profile: CareerProfile; aiSettings: CareerAiSettings;
  confirmedAt: string | null; updatedAt: string | null; accountEmail: string;
};

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function stringFields(value: unknown, fields: string[]): boolean {
  return record(value) && fields.every((key) => typeof value[key] === "string");
}
function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item: unknown) => typeof item === "string");
}
function entries(value: unknown, fields: string[]): boolean {
  return Array.isArray(value) && value.every((item: unknown) => stringFields(item, fields));
}
function isResponse(value: unknown): value is CareerProfileResponse {
  if (!record(value) || !record(value.profile) || !record(value.aiSettings)) return false;
  const p = value.profile;
  const a = value.aiSettings;
  return typeof value.version === "number" && Number.isInteger(value.version) && value.version >= 0 &&
    typeof value.accountEmail === "string" &&
    (value.confirmedAt === null || typeof value.confirmedAt === "string") &&
    (value.updatedAt === null || typeof value.updatedAt === "string") &&
    stringFields(p, ["fullName", "phone", "location", "professionalTitle", "summary"]) &&
    strings(p.skills) && strings(p.languages) &&
    entries(p.experience, ["title", "organization", "startMonth", "endMonth", "description"]) &&
    Array.isArray(p.experience) && p.experience.every((item: unknown) => record(item) && typeof item.current === "boolean") &&
    entries(p.education, ["qualification", "institution", "startMonth", "endMonth", "description"]) &&
    entries(p.projects, ["name", "description"]) && entries(p.links, ["label", "url"]) &&
    typeof a.tailorResume === "boolean" && typeof a.coverLetter === "boolean" && typeof a.gapQuestions === "boolean" &&
    ["auto", "en", "ne"].includes(String(a.language)) && a.reviewBeforeSubmit === true && a.autoApply === false;
}

export class ProfileRequestError extends Error {
  constructor(message: string, readonly status: number, readonly fields: string[] = []) { super(message); }
}

async function responseBody(response: Response): Promise<unknown> {
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    let fields: string[] = [];
    let message = response.status === 401 ? "Your session expired. Sign in again to continue." :
      response.status === 409 ? "A newer profile was saved in another session. Reload it before saving." :
      response.status >= 500 ? "The profile service is unavailable. Your edits are still here; try again shortly." : "Could not save your profile. Please try again.";
    if (response.status === 400 && record(body) && Array.isArray(body.errors)) {
      fields = body.errors.filter(record).flatMap((error) => typeof error.path === "string" ? [error.path] : []);
      message = body.errors.filter(record).map((error) => `${String(error.path)}: ${String(error.message)}`).join("; ");
    }
    throw new ProfileRequestError(message, response.status, fields);
  }
  return body;
}

export async function loadCareerProfile(signal?: AbortSignal): Promise<CareerProfileResponse> {
  const body = await responseBody(await authFetch("/api/me/profile", { signal, cache: "no-store" }));
  if (!isResponse(body)) throw new Error("The profile service returned an unexpected response. Please reload.");
  return body;
}

export async function saveCareerProfile(data: CareerProfileResponse, confirmFacts: boolean, signal?: AbortSignal): Promise<CareerProfileResponse> {
  try {
    const body = await responseBody(await authFetch("/api/me/profile", {
      method: "PUT", signal, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expectedVersion: data.version, profile: data.profile, aiSettings: data.aiSettings, confirmFacts }),
    }));
    if (!isResponse(body)) throw new Error("Unexpected save response");
    return body;
  } catch (cause: unknown) {
    if (cause instanceof ProfileRequestError && cause.status < 500) throw cause;
    throw new ProfileRequestError("We could not confirm whether your save completed. Download your draft, then reload the latest saved profile before trying again.", 0);
  }
}

export async function loadCvSuggestions(signal?: AbortSignal): Promise<{ filename: string; profile: CareerProfile } | null> {
  const body = await responseBody(await authFetch("/api/me/profile/cv-suggestions", { signal, cache: "no-store" }));
  if (!record(body)) throw new Error("The CV service returned an unexpected response.");
  if (body.source === null) return null;
  if (!record(body.source) || typeof body.source.filename !== "string" || !record(body.suggestions)) throw new Error("CV suggestions are unavailable.");
  const suggestion = body.suggestions;
  if (!isProfile(suggestion)) throw new Error("CV suggestions are incomplete. Enter your details manually.");
  return { filename: body.source.filename, profile: suggestion };
}
function isProfile(value: unknown): value is CareerProfile {
  return record(value) && stringFields(value, ["fullName", "phone", "location", "professionalTitle", "summary"]) &&
    strings(value.skills) && strings(value.languages) &&
    entries(value.experience, ["title", "organization", "startMonth", "endMonth", "description"]) &&
    Array.isArray(value.experience) && value.experience.every((item: unknown) => record(item) && typeof item.current === "boolean") &&
    entries(value.education, ["qualification", "institution", "startMonth", "endMonth", "description"]) &&
    entries(value.projects, ["name", "description"]) && entries(value.links, ["label", "url"]);
}
